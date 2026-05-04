// #include <ESP8266WiFi.h>
// #include <WebSocketsServer.h>
// #include <SPI.h>
// #include <MFRC522.h>

// // WiFi settings
// const char* ssid = "dhananjai";
// const char* password = "dhruvbhai";

// // --- FEEDBACK PINS ---
// #define BUZZER_PIN D2   // GPIO4 - Buzzer (Any Scan)
// #define BLUE_LED_PIN D0  // GPIO16 - Blue LED (Any Scan)

// // --- RFID READER 1 (ADD ITEM) ---
// #define RST_PIN D3
// #define SS_PIN  D8 // Chip Select 1 (GPIO15)
// MFRC522 mfrc522_add(SS_PIN, RST_PIN);

// // --- RFID READER 2 (REMOVE ITEM) ---
// #define RST_PIN2 D4
// #define SS_PIN2  D1 // Chip Select 2 (GPIO5)
// MFRC522 mfrc522_remove(SS_PIN2, RST_PIN2);

// // WebSocket server on port 81
// WebSocketsServer webSocket = WebSocketsServer(81);

// // --- NON-BLOCKING TIMER VARIABLES (INCREASED COOLDOWN) ---
// unsigned long feedbackStartTime = 0;
// // Duration the LED/Buzzer is ON after a scan
// const int FEEDBACK_DURATION = 500;
// // *** CRITICAL FIX: Increased cooldown to 3500ms (3.5 seconds) to prevent
// double reads. *** const int COOLDOWN_PERIOD = 3500; bool feedbackActive =
// false;

// // Function prototypes
// void checkFeedback();
// String getTimeString();
// String getUidString(MFRC522 *mfrc);
// void readAndSendCard(MFRC522 *mfrc, const char* action);
// void webSocketEvent(uint8_t client, WStype_t type, uint8_t * payload, size_t
// length);

// // ------------------- NON-BLOCKING HARDWARE FEEDBACK -------------------
// void hardwareFeedback() {
//   digitalWrite(BLUE_LED_PIN, HIGH);
//   digitalWrite(BUZZER_PIN, HIGH);
//   feedbackStartTime = millis();
//   feedbackActive = true;
// }

// void checkFeedback() {
//   if (feedbackActive && (millis() - feedbackStartTime >= FEEDBACK_DURATION))
//   {
//     digitalWrite(BUZZER_PIN, LOW);
//     digitalWrite(BLUE_LED_PIN, LOW);
//     feedbackActive = false;
//   }
// }

// // ------------------- SETUP -------------------

// void setup() {
//   Serial.begin(115200);

//   pinMode(BUZZER_PIN, OUTPUT);
//   pinMode(BLUE_LED_PIN, OUTPUT);
//   digitalWrite(BUZZER_PIN, LOW);
//   digitalWrite(BLUE_LED_PIN, LOW);

//   WiFi.begin(ssid, password);

//   Serial.print("Connecting to WiFi");
//   while (WiFi.status() != WL_CONNECTED) {
//     delay(500);
//     Serial.print(".");
//   }
//   Serial.println("\nConnected!");
//   Serial.print("ESP8266 IP: ");
//   Serial.println(WiFi.localIP());

//   SPI.begin();
//   mfrc522_add.PCD_Init();
//   mfrc522_remove.PCD_Init();

//   webSocket.begin();
//   webSocket.onEvent(webSocketEvent);

//   Serial.println("Two RFID Readers Ready...");
// }

// // ------------------- HELPER FUNCTIONS -------------------
// String getTimeString() {
//   unsigned long sec = millis() / 1000;
//   return String(sec) + "s";
// }

// String getUidString(MFRC522 *mfrc) {
//   String uidStr = "";
//   for (byte i = 0; i < mfrc->uid.size; i++) {
//     if (mfrc->uid.uidByte[i] < 0x10) uidStr += "0";
//     uidStr += String(mfrc->uid.uidByte[i], HEX);
//     if (i < mfrc->uid.size - 1) uidStr += ":";
//   }
//   return uidStr;
// }

// // ------------------- CARD READING LOGIC (COOLDOWN APPLIED)
// ------------------- void readAndSendCard(MFRC522 *mfrc, const char* action) {
//   // Check if we are still within the global cooldown period
//   if (millis() - feedbackStartTime < COOLDOWN_PERIOD) return;

//   if (!mfrc->PICC_IsNewCardPresent()) return;
//   if (!mfrc->PICC_ReadCardSerial()) return;

//   String uidStr = getUidString(mfrc);
//   uidStr.toUpperCase();

//   Serial.print("Card UID: ");
//   Serial.print(uidStr);
//   Serial.print(" -> Action: ");
//   Serial.println(action);

//   // 1. Send data to the web client
//   String json = "{\"uid\":\"" + uidStr + "\",\"action\":\"" + String(action)
//   + "\",\"time\":\"" + getTimeString() + "\"}"; webSocket.broadcastTXT(json);

//   // 2. Provide immediate hardware feedback (Starts the COOLDOWN timer)
//   hardwareFeedback();

//   // Halt card
//   mfrc->PICC_HaltA();
//   mfrc->PCD_StopCrypto1();
// }

// // ------------------- MAIN LOOP -------------------
// void loop() {
//   webSocket.loop();
//   checkFeedback();

//   readAndSendCard(&mfrc522_add, "add");
//   readAndSendCard(&mfrc522_remove, "remove");

//   delay(10);
// }

// // ------------------- WEBSOCKET EVENT -------------------
// void webSocketEvent(uint8_t client, WStype_t type, uint8_t * payload, size_t
// length) {
//   if (type == WStype_CONNECTED) {
//     Serial.println("Client connected");
//     webSocket.sendTXT(client, "Hello from ESP8266!");
//   }
// }