// #include <ESP8266WiFi.h>
// #include <ESP8266WebServer.h>

// const char* ssid = "dhananjai";
// const char* password = "dhruvbhai";

// ESP8266WebServer server(80);

// bool ledState = LOW;

// void handleRoot() {
//   server.send(200, "text/plain", "ESP LED Control");
// }

// void handleLEDOn() {
//   digitalWrite(LED_BUILTIN, LOW); // Built-in LED is active LOW
//   ledState = true;
//   server.send(200, "text/plain", "LED ON");
// }

// void handleLEDOff() {
//   digitalWrite(LED_BUILTIN, HIGH);
//   ledState = false;
//   server.send(200, "text/plain", "LED OFF");
// }

// void handleStatus() {
//   server.send(200, "text/plain", ledState ? "ON" : "OFF");
// }

// void setup() {
//   Serial.begin(9600);
//   pinMode(LED_BUILTIN, OUTPUT);
//   digitalWrite(LED_BUILTIN, HIGH); // Default OFF

//   WiFi.begin(ssid, password);
//   Serial.print("\nConnecting to WiFi");

//   while (WiFi.status() != WL_CONNECTED) {
//     delay(500);
//     Serial.print(".");
//   }

//   Serial.println("\nConnected!");
//   Serial.print("ESP IP Address: ");
//   Serial.println(WiFi.localIP()); // NOTE THIS IP

//   server.on("/", handleRoot);
//   server.on("/led/on", handleLEDOn);
//   server.on("/led/off", handleLEDOff);
//   server.on("/led/status", handleStatus);

//   server.begin();
//   Serial.println("HTTP server started");
// }

// void loop() {
//   server.handleClient();
// }
