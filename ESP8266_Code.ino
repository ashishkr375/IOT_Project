#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <Hash.h>
#include <ESPAsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <ESP8266mDNS.h> 
#include <ArduinoJson.h>
#include <NTPClient.h>
#include <WiFiClientSecure.h>
#include "SinricPro.h"
#include "SinricProSwitch.h"


const char* serverName = "iot-project-one.vercel.app";

#define APP_KEY           "c67f0479-171e-4961-a421-62a663438c8b"
#define APP_SECRET        "7ced3ca5-6aab-4750-968d-d149762b7486-7066f644-61e7-4acb-b758-7872c97f2c46"

#define SWITCH_ID_1       "6741691a13f98f1416f30f5d"
#define SWITCH_ID_2       "67416eb68916d6b80a1ff40a"



const char* ssid1 = "NITP";          
const char* password1 = "Admin#2024"; 

const char* ssid2 = "realme 9 Pro 5G";
const char* password2 = "ashu12345";
WiFiClient client;
// Set the NTP server and timezone
const char* ntpServer = "pool.ntp.org";
const long utcOffsetInSeconds = 19800;

WiFiUDP udp;
NTPClient timeClient(udp, ntpServer, utcOffsetInSeconds);


void sendIpToServer() {
  WiFiClientSecure client;
  client.setInsecure(); 

  if (client.connect(serverName, 443)) { 
    String ip = WiFi.localIP().toString();  
    String jsonPayload = "{\"ip\": \"" + ip + "\"}"; 

    client.println("POST /api/add HTTP/1.1");
    client.println("Host: iot-project-one.vercel.app");
    client.println("Content-Type: application/json");
    client.print("Content-Length: ");
    client.println(jsonPayload.length());
    client.println("Connection: close");
    client.println();
    client.println(jsonPayload);

 
    while (client.connected() || client.available()) {
      if (client.available()) {
        String response = client.readString();
        Serial.println("Server response:");
        Serial.println(response);
        break;
      }
    }
    client.stop();
  } else {
    Serial.println("Failed to connect to the server to send IP");
  }
  timeClient.begin();
}

#define DHTPIN 5   
#define DHTTYPE    DHT11 
DHT dht(DHTPIN, DHTTYPE);


float t = 0.0, h = 0.0;


String acMode = "automatic";
bool led1Status = false, led2Status = false, led3Status = false; //ac light
bool lightStatus = false; //room light


#define AC_LED_1 4
#define AC_LED_2 0
#define AC_LED_3 2


#define LIGHT_PIN 14


AsyncWebServer server(80);




unsigned long previousMillis = 0;
const long interval = 10000;  

const char index_html[] PROGMEM = R"rawliteral(
<!DOCTYPE HTML>
<html lang="en">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.2/css/all.css" integrity="sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr" crossorigin="anonymous">
  <style>
    /* Basic reset and box-sizing */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    /* Body and general layout */
    body {
      font-family: 'Arial', sans-serif;
      background-color: #f4f4f9;
      color: #333;
      text-align: center;
      line-height: 1.6;
    }

    h2 {
      font-size: 2.2rem;
      margin-bottom: 20px;
      color: #059e8a;
    }

    p {
      font-size: 1.4rem;
      margin-bottom: 15px;
      color: #555;
    }

    .units {
      font-size: 1rem;
      color: #333;
    }

    /* Icons styling */
    .fa-thermometer-half,
    .fa-tint {
      font-size: 2rem;
      color: #059e8a;
    }

    .dht-labels {
      font-size: 1.2rem;
      font-weight: 600;
      color: #333;
    }

    /* Status section styles */
    .status {
      margin-top: 30px;
      padding: 20px;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }

    .status h3 {
      font-size: 1.6rem;
      color: #059e8a;
      margin-bottom: 15px;
    }

    .status p {
      font-size: 1.2rem;
      margin: 5px 0;
    }

    .status span {
      font-weight: bold;
      color: #333;
    }

    .status .led-status {
      color: green;
    }

    .status .light-status {
      color: #f39c12;
    }

    /* IP address display */
    .ip-address {
      font-size: 1.2rem;
      color: #059e8a;
      margin-top: 20px;
    }

    /* Footer styling */
    footer {
      background-color: black;
      color: white;
      padding: 5px;
      font-size: 1.1rem;
      position: fixed;
      bottom: 0;
      width: 100%;
      text-align: center;
      font-weight: 700;
    }

    /* Mobile responsiveness */
    @media (max-width: 600px) {
      h2 {
        font-size: 1.8rem;
      }

      .status h3 {
        font-size: 1.4rem;
      }

      .status p {
        font-size: 1rem;
      }

      .fa-thermometer-half, .fa-tint {
        font-size: 1.6rem;
      }

      .units {
        font-size: 0.9rem;
      }

      footer {
        font-size: 1rem;
      }
    }
  </style>
</head>
<body>
  <h2>IotAutomate - Home Automation and Control Server</h2>
  <div class="status">
    <p>
      <i class="fas fa-thermometer-half"></i>
      <span class="dht-labels">Temperature: </span>
      <span id="temperature">%TEMPERATURE%</span>
      <sup class="units">°C</sup>
    </p>
    <p>
      <i class="fas fa-tint"></i>
      <span class="dht-labels">Humidity: </span>
      <span id="humidity">%HUMIDITY%</span>
      <sup class="units">%</sup>
    </p>

    <h3>AC Status:</h3>
    <p>Mode: <span id="ac-mode">%AC_MODE%</span></p>
    <p>LED 1: <span id="led1-status">%LED1_STATUS%</span></p>
    <p>LED 2: <span id="led2-status">%LED2_STATUS%</span></p>
    <p>LED 3: <span id="led3-status">%LED3_STATUS%</span></p>

    <h3>Light Status:</h3>
    <p>Light: <span id="light-status">%LIGHT_STATUS%</span></p>
  </div>

  <p class="ip-address">Running on IP: <span id="ip-address"></span></p>

  <footer>
    <p>Powered by IoTAutomate Group</p>
  </footer>

  <script>
    // Update IP address dynamically using the local IP from the device
    document.getElementById("ip-address").innerHTML = window.location.hostname;

    setInterval(function () {
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          document.getElementById("temperature").innerHTML = this.responseText;
        }
      };
      xhttp.open("GET", "/temperature", true);
      xhttp.send();
    }, 2000);

    setInterval(function () {
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          document.getElementById("humidity").innerHTML = this.responseText;
        }
      };
      xhttp.open("GET", "/humidity", true);
      xhttp.send();
    }, 2000);

    setInterval(function () {
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          var status = JSON.parse(this.responseText);
          document.getElementById("ac-mode").innerHTML = status.ac_mode;
          document.getElementById("led1-status").innerHTML = status.led1_status;
          document.getElementById("led2-status").innerHTML = status.led2_status;
          document.getElementById("led3-status").innerHTML = status.led3_status;
          document.getElementById("light-status").innerHTML = status.light_status;
        }
      };
      xhttp.open("GET", "/status", true);
      xhttp.send();
    }, 2000);
  </script>
</body>
</html>

)rawliteral";

void connectWiFi() {
  WiFi.begin(ssid1, password1);
  Serial.println("Connecting to WiFi...");
  int retryCount = 0;
  while (WiFi.status() != WL_CONNECTED && retryCount < 20) {
    delay(1000);
    Serial.print(".");
    retryCount++;
  }
sendIpToServer();
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Connecting to second network...");
    WiFi.begin(ssid2, password2);
    retryCount = 0;
    while (WiFi.status() != WL_CONNECTED && retryCount < 100) {
      delay(1000);
      Serial.print(".");
      retryCount++;
    }
  }
sendIpToServer();
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("WiFi connected");
    Serial.println("IP Address: " + WiFi.localIP().toString());
  } else {
    Serial.println("WiFi connection failed");
  }
   sendIpToServer();
}



void updateLEDs() {
  digitalWrite(AC_LED_1, led1Status ? HIGH : LOW);
  digitalWrite(AC_LED_2, led2Status ? HIGH : LOW);
  digitalWrite(AC_LED_3, led3Status ? HIGH : LOW);
}

void updateLight() {
  digitalWrite(LIGHT_PIN, lightStatus ? HIGH : LOW);
}

bool onPowerState1(const String &deviceId, bool &state) {
 Serial.printf("Light turned %s", state?"on":"off");
 digitalWrite(LIGHT_PIN, state ? HIGH:LOW);
  if(state==HIGH){
    lightStatus = true;
  }else{
    lightStatus = false;
  }
 return true;
}


bool onPowerState2(const String &deviceId, bool &state) {
 Serial.printf("AC_LED_1 turned %s", state?"on":"off");
 digitalWrite(AC_LED_1, state ? HIGH:LOW);
 if(state==HIGH){
    led1Status  = true;
  }else{
    led1Status  = false;
  }
 return true;
}
void sendTempHumidityToServer() {
  WiFiClientSecure client;
  client.setInsecure();

  if (client.connect(serverName, 443)) { 
    String temperature = String(t);
    String humidity = String(h);
    String jsonPayload = "{\"temperature\": \"" + temperature + "\", \"humidity\": \"" + humidity + "\"}"; 

    client.println("POST /api/data HTTP/1.1");
    client.println("Host: iot-project-one.vercel.app");
    client.println("Content-Type: application/json");
    client.print("Content-Length: ");
    client.println(jsonPayload.length());
    client.println("Connection: close");
    client.println();
    client.println(jsonPayload);


    while (client.connected() || client.available()) {
      if (client.available()) {
        String response = client.readString();
        Serial.println("Server response:");
        Serial.println(response);
        break;
      }
    }
    client.stop();
  } else {
    Serial.println("Failed to connect to the server to send humidity and temperature data");
  }
}

// SinricPro
void setupSinricPro() {
  
  pinMode(LIGHT_PIN, OUTPUT);
  pinMode(AC_LED_1, OUTPUT); 
  SinricProSwitch& mySwitch1 = SinricPro[SWITCH_ID_1];
  mySwitch1.onPowerState(onPowerState1);
  SinricProSwitch& mySwitch2 = SinricPro[SWITCH_ID_2];
  mySwitch2.onPowerState(onPowerState2);
  
  
 
  SinricPro.onConnected([](){ Serial.printf("Connected to SinricPro\r\n"); }); 
  SinricPro.onDisconnected([](){ Serial.printf("Disconnected from SinricPro\r\n"); });
   
  SinricPro.begin(APP_KEY, APP_SECRET);
}

void setup() {
 
  Serial.begin(115200);
  dht.begin();

  connectWiFi(); 

  if (MDNS.begin("iotautomate")) {
    Serial.println("mDNS responder started go to iotautomate.local");
  } else {
    Serial.println("Error starting mDNS");
  }

 
  pinMode(AC_LED_1, OUTPUT);
  pinMode(AC_LED_2, OUTPUT);
  pinMode(AC_LED_3, OUTPUT);
  pinMode(LIGHT_PIN, OUTPUT);


  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send_P(200, "text/html", index_html);
  });
  
  server.onNotFound([](AsyncWebServerRequest *request){
    
    request->send(404, "application/json", "{\"error\":\"Not Found\"}");
  });


 
server.on("/temperature", HTTP_GET, [](AsyncWebServerRequest *request){
  
  AsyncWebServerResponse *response = request->beginResponse(200, "text/plain", String(t).c_str());
  
  
  response->addHeader("Access-Control-Allow-Origin", "*");
  

  request->send(response);
});

server.on("/humidity", HTTP_GET, [](AsyncWebServerRequest *request){

  AsyncWebServerResponse *response = request->beginResponse(200, "text/plain", String(h).c_str());
  

  response->addHeader("Access-Control-Allow-Origin", "*");
  

  request->send(response);
});


server.on("/status", HTTP_GET, [](AsyncWebServerRequest* request) {
  String response;
  StaticJsonDocument<256> doc;
  doc["ac_mode"] = acMode;
  doc["led1_status"] = led1Status ? "ON" : "OFF";
  doc["led2_status"] = led2Status ? "ON" : "OFF";
  doc["led3_status"] = led3Status ? "ON" : "OFF";
  doc["light_status"] = lightStatus ? "ON" : "OFF";
  serializeJson(doc, response);
  

  AsyncWebServerResponse *res = request->beginResponse(200, "application/json", response);
  

  res->addHeader("Access-Control-Allow-Origin", "*");
  

  request->send(res);
});


server.on("/control", HTTP_GET, [](AsyncWebServerRequest* request) {
  if (request->hasParam("mode")) {
    acMode = request->getParam("mode")->value();
  }


  if (acMode == "manual") {
    if (request->hasParam("led1")) {
      led1Status = request->getParam("led1")->value() == "1";
    }
    if (request->hasParam("led2")) {
      led2Status = request->getParam("led2")->value() == "1";
    }
    if (request->hasParam("led3")) {
      led3Status = request->getParam("led3")->value() == "1";
    }
  }



  if (request->hasParam("light")) {
    lightStatus = request->getParam("light")->value() == "1";
  }


  updateLEDs();
  updateLight();
  

  AsyncWebServerResponse *response = request->beginResponse(200, "text/plain", "Updated successfully");
  response->addHeader("Access-Control-Allow-Origin", "*");
  

  request->send(response);
});

  server.begin();
  setupSinricPro();
  sendTempHumidityToServer();
}

void loop() {
  
  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;
    h = dht.readHumidity();
    t = dht.readTemperature();
    if (isnan(h) || isnan(t)) {
      Serial.println("Failed to read from DHT sensor!");
    }else{
      
    }
  }


  if (acMode == "automatic") {
      
      if (t < 16) {
        led1Status = false;
        led2Status = false;
        led3Status = false;
      } else if (t >= 16 && t < 22) {
        led1Status = true;
        led2Status = false;
        led3Status = false;
      } else if (t >= 22 && t < 30) {
        led1Status = true;
        led2Status = true;
        led3Status = false;
      } else {
        led1Status = true;
        led2Status = true;
        led3Status = true;
      }

   updateLEDs();
   
   
}
SinricPro.handle();

}

