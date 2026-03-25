"use client"
import React, { useEffect } from 'react';
import { ArrowLeft, Star, ShoppingCart } from 'lucide-react';
import { Product } from '../types/product.d';

/**
 * Renders the detail view for a single product.
 */
const ProductDetailView: React.FC<{ 
    product: Product, 
    onClose: () => void, 
    updateCartItem: (p: Product, qty: number) => void 
}> = ({ product, onClose, updateCartItem }) => {
      useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);
    const displayDescription = product.description || `A high-quality product in the ${product.category} category. Click the 'Add to Cart' button to purchase this item now!`;

    return (
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-2xl p-6 sm:p-10 my-8">
            <button 
                onClick={onClose} 
                className="flex items-center text-blue-600 hover:text-blue-800 transition duration-150 mb-6 font-medium"
            >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Store
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Product Image Section */}
                <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                    {product.image.startsWith('http') ? (
                        <img 
                            src={product.image} 
                            alt={product.name} 
                            className="max-w-full max-h-80 object-contain " 
                        />
                    ) : (
                        <span className="text-8xl">{product.image}</span>
                    )}
                </div>

                {/* Product Info Section */}
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">{product.name}</h1>
                    
                    {/* Price and Rating */}
                    <div className="flex items-baseline space-x-4 mb-4 pb-4 border-b">
                        <span className="text-4xl font-bold text-blue-600">
                            ₹{product.price.toFixed(2)}
                        </span>
                        {product.rating && (
                            <div className="flex items-center text-xl text-yellow-500 font-bold">
                                <Star className='w-5 h-5 fill-yellow-500 mr-1' />
                                {product.rating}
                            </div>
                        )}
                        <span className="text-sm text-gray-500">
                            (Category: {product.category})
                        </span>
                    </div>

                    {/* Description */}
                    <h2 className="text-xl font-semibold text-gray-700 mb-3">Product Description</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        {displayDescription}
                    </p>

                    {/* Metadata */}
                    <div className="space-y-2 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border">
                        <p><span className="font-semibold text-gray-800">Product ID:</span> {product.id}</p>
                        {product.seller && <p><span className="font-semibold text-gray-800">Seller:</span> {product.seller}</p>}
                        {product.qtyLabel && <p><span className="font-semibold text-gray-800">Quantity Unit:</span> {product.qtyLabel}</p>}
                    </div>

                    {/* Action Button */}
                    <button 
                        onClick={() => {
                            updateCartItem(product, 1);
                            onClose(); // Automatically go back to the store after adding
                        }} 
                        className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-xl hover:shadow-2xl flex items-center justify-center space-x-2 text-lg"
                    >
                        <ShoppingCart className='w-5 h-5'/>
                        <span>Add to Cart</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailView;