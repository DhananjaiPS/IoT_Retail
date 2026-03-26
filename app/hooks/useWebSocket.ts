import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types/product.d';
import { PRODUCT_DATA, mapDbProductToCart } from '../data/productData';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

interface WebSocketControls {
    connectionStatus: ConnectionStatus;
}

const ESP32_IP = '10.113.135.161'; 
const DEBOUNCE_TIME = 500; 

export const useWebSocket = (
    updateCartItem: (product: Product, quantityToAdd?: number) => void,
    setCartItems: React.Dispatch<React.SetStateAction<Product[]>>
): WebSocketControls => {
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');

    const handleMessage = useCallback((data: { uid: string, action: 'add' | 'remove', time: string }) => {
        const uid = data.uid.toUpperCase().replace(/:/g, ''); 
        const { action, time } = data;
        const productInfo = PRODUCT_DATA[uid];

        if (action === 'add') {
            if (productInfo) { 
                const cartProduct = mapDbProductToCart(uid, productInfo, time || "");
                updateCartItem(cartProduct); 
                console.log(`RFID Scan [ADD]: Added ${cartProduct.name} (UID: ${uid}) to cart.`);
            } else {
                console.warn(`RFID Scan [ADD]: Unknown UID ${uid}`);
                updateCartItem({
                    id: uid, name: "Unknown Product", price: 0.00, 
                    category: "Unknown", image: "❓", time: time
                });
            }
        } 
        else if (action === 'remove') {
            setCartItems(prev => {
                const existing = prev.find(item => item.id === uid);
                if (existing && (existing.quantity || 0) > 0) {
                    console.log(`RFID Scan [REMOVE]: Removed 1x ${existing.name} (UID: ${uid}) from cart.`);
                    return prev
                        .map(item => item.id === uid ? { ...item, quantity: (item.quantity || 1) - 1 } : item)
                        .filter(item => (item.quantity || 0) > 0);
                } else {
                    console.warn(`RFID Scan [REMOVE]: Tried to remove UID ${uid}. Not found or quantity zero. Action ignored.`);
                    return prev;
                }
            });
        } else {
            console.warn(`WebSocket: Received unknown action type: ${action}`);
        }
    }, [updateCartItem, setCartItems]);

    useEffect(() => {
        const wsUrl = `ws://${ESP32_IP}:81/`; 
        let ws: WebSocket; 
        let reconnectInterval: NodeJS.Timeout;
        const lastProcessedTime: Record<string, number> = {};

        const connectWebSocket = () => {
            setConnectionStatus('connecting'); 
            try {
                ws = new WebSocket(wsUrl);
            } catch (err) {
                console.warn("WebSocket connection blocked (likely due to HTTPS mixed content). Operating in manual mode.", err);
                setConnectionStatus('disconnected');
                return; // Exit early, do not attach listeners or set intervals for reconnect (it will keep failing)
            }

            ws.onopen = () => {
                setConnectionStatus('connected'); 
                if (reconnectInterval) clearInterval(reconnectInterval); 
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data); 
                    const uid = data.uid.toUpperCase().replace(/:/g, ''); 
                    const action = data.action; 
                    
                    const messageKey = `${uid}:${action}`; 
                    const currentTime = Date.now();
                    
                    if (currentTime - (lastProcessedTime[messageKey] || 0) < DEBOUNCE_TIME) {
                        return; // Debounced
                    }
                    lastProcessedTime[messageKey] = currentTime; 

                    handleMessage(data);
                } catch (e) { 
                    if (!event.data.startsWith("Hello")) {
                        console.warn("WebSocket Non-JSON Message:", event.data, e);
                    }
                }
            };

            ws.onclose = () => { 
                setConnectionStatus('disconnected'); 
                reconnectInterval = setInterval(connectWebSocket, 3000); 
            };

            ws.onerror = (error) => { 
                console.error("WebSocket Error:", error);
                ws.close(); 
            };
        };

        connectWebSocket();
        
        return () => { 
            if (ws) ws.close(); 
            if (reconnectInterval) clearInterval(reconnectInterval); 
        };
    }, [handleMessage]); 

    return { connectionStatus };
};