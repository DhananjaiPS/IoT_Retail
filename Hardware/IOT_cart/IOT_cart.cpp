// #include <ESP8266WiFi.h>
// #include <ESP8266WebServer.h>
// #include <SPI.h>
// #include <MFRC522.h>
// #include <Wire.h>
// #include <LiquidCrystal_I2C.h>

// // ------------------- RFID PINS -------------------
// #define SS_PIN D8
// #define RST_PIN D4
// MFRC522 rfid(SS_PIN, RST_PIN);

// // ------------------- LCD -------------------
// LiquidCrystal_I2C lcd(0x3F, 16, 2);

// // ------------------- BUZZER -------------------
// #define BUZZER_PIN D0

// // ------------------- WIFI CONFIG -------------------
// const char* ssid = "dhananjai";
// const char* password = "dhruvbhai";

// ESP8266WebServer server(80);

// String lastItem = "Waiting...";
// String lastUID = "None";

// void setup() {
//   Serial.begin(115200);
//   Serial.println("\nStarting RFID System...");

//   SPI.begin();
//   rfid.PCD_Init();

//   lcd.init();
//   lcd.backlight();
//   lcd.print("Connecting WiFi");

//   pinMode(BUZZER_PIN, OUTPUT);

//   WiFi.begin(ssid, password);
//   Serial.print("Connecting to WiFi");

//   int attempts = 0;
//   while (WiFi.status() != WL_CONNECTED && attempts < 20) {
//     delay(1000);
//     Serial.print(".");
//     attempts++;
//   }

//   if (WiFi.status() == WL_CONNECTED) {
//     Serial.println("\n✅ WiFi Connected!");
//     Serial.print("📱 IP Address: ");
//     Serial.println(WiFi.localIP());

//     lcd.clear();
//     lcd.print("IP:");
//     lcd.setCursor(0, 1);
//     lcd.print(WiFi.localIP());
//     delay(3000);

//     lcd.clear();
//     lcd.print("Ready to Scan");
//   } else {
//     Serial.println("\n❌ WiFi Failed!");
//     lcd.clear();
//     lcd.print("WiFi Failed");
//     return;
//   }

//   // Web server routes
// //   server.on("/scan", HTTP_GET, []() {
// //   String json = "{\"item\":\"" + lastItem + "\",\"uid\":\"" + lastUID +
// "\"}";
// //   server.send(200, "application/json", json);
// //   Serial.println("New scan sent to webpage!");
// // });

// server.on("/", HTTP_GET, []() {
//     String json = "{\"item\":\"" + lastItem + "\",\"uid\":\"" + lastUID +
//     "\"}"; server.send(200, "application/json", json);
// });

//   // server.on("/", HTTP_GET, []() {
//   //   String json = "{\"item\":\"" + lastItem + "\",\"uid\":\"" + lastUID +
//   "\"}";
//   //   server.send(200, "application/json", json);
//   //   Serial.println("📡 Served JSON to client: " + json);
//   // });

//   server.on("/status", HTTP_GET, []() {
//     server.send(200, "text/plain", "Server is running! Last item: " +
//     lastItem);
//   });

//   server.begin();
//   Serial.println("✅ HTTP server started on port 80");
//   Serial.println("📍 Use this IP in your browser: http://" +
//   WiFi.localIP().toString());
// }

// void loop() {
//   server.handleClient();

//   if (rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
//     digitalWrite(BUZZER_PIN, HIGH);
//     delay(100);
//     digitalWrite(BUZZER_PIN, LOW);

//     String cardID = "";
//     for (byte i = 0; i < rfid.uid.size; i++) {
//       cardID += String(rfid.uid.uidByte[i] < 0x10 ? "0" : "");
//       cardID += String(rfid.uid.uidByte[i], HEX);
//       if (i < rfid.uid.size - 1) cardID += " ";
//     }
//     cardID.toUpperCase();
//     lastUID = cardID;

//     // Product Mapping
//     if (cardID == "1A 79 BB 03") lastItem = "Milk";
//     else if (cardID == "07 6B BA 03") lastItem = "Bread";
//     else if (cardID == "E3 53 23 31") lastItem = "Eggs";
//     else if (cardID == "53 16 3D FB") lastItem = "Maggie";
//     else lastItem = "Unknown";

//     lcd.clear();
//     lcd.setCursor(0, 0);
//     lcd.print(lastItem);
//     lcd.setCursor(0, 1);
//     lcd.print(lastUID);

//     Serial.println("✅ RFID Scan => " + lastItem + " | " + lastUID);

//     rfid.PICC_HaltA();
//     rfid.PCD_StopCrypto1();
//   }
//   delay(100);
// }