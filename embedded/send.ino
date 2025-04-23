#include <Wire.h>
#include <LSM6.h>
#include <LIS3MDL.h>
#include <MadgwickAHRS.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

LSM6 imu;
LIS3MDL mag;
Madgwick filter;

const int flexLittle = 33;
const int flexRing = 32;
const int flexMiddle = 35;
const int flexIndex = 34;
const int flexThumb = 39;


const char* ssid = "YourWiFiSSID";
const char* password = "YourWiFiPassword";


const char* serverUrl = "http://your-server-ip:5001/predict";

unsigned long lastSendTime = 0;
const int sendInterval = 20;
const int httpSendInterval = 200;

void setup() {
  Serial.begin(115200);
  Wire.begin(22, 23);
  imu.init();
  imu.enableDefault();
  mag.init();
  mag.enableDefault();
  pinMode(flexLittle, INPUT);
  pinMode(flexRing, INPUT);
  pinMode(flexMiddle, INPUT);
  pinMode(flexIndex, INPUT);
  pinMode(flexThumb, INPUT);
  
  filter.begin(50);
  

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  
  delay(1000);
}

void loop() {
  unsigned long currentTime = millis();
  
  if (currentTime - lastSendTime >= sendInterval) {
    imu.read();
    
    int fl = analogRead(flexLittle);
    int fr = analogRead(flexRing);
    int fm = analogRead(flexMiddle);
    int fi = analogRead(flexIndex);
    int ft = analogRead(flexThumb);
    
    float ax = imu.a.x;
    float ay = imu.a.y;
    float az = imu.a.z;
    float gx = imu.g.x * DEG_TO_RAD;
    float gy = imu.g.y * DEG_TO_RAD;
    float gz = imu.g.z * DEG_TO_RAD;
    
    filter.updateIMU(gx, gy, gz, ax, ay, az);
    
    float q0 = filter.q0;
    float q1 = filter.q1;
    float q2 = filter.q2;
    float q3 = filter.q3;
    
    
    Serial.print(fl); Serial.print(",");
    Serial.print(fr); Serial.print(",");
    Serial.print(fm); Serial.print(",");
    Serial.print(fi); Serial.print(",");
    Serial.print(ft); Serial.print(",");
    Serial.print(q0); Serial.print(",");
    Serial.print(q1); Serial.print(",");
    Serial.print(q2); Serial.print(",");
    Serial.println(q3);
    
    
    static unsigned long lastHttpSendTime = 0;
    if (currentTime - lastHttpSendTime >= httpSendInterval) {
      if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(serverUrl);
        http.addHeader("Content-Type", "application/json");
        
        
        StaticJsonDocument<256> doc;
        doc["flex_little"] = fl;
        doc["flex_ring"] = fr;
        doc["flex_middle"] = fm;
        doc["flex_index"] = fi;
        doc["flex_thumb"] = ft;
        doc["quat_w"] = q0;
        doc["quat_x"] = q1;
        doc["quat_y"] = q2;
        doc["quat_z"] = q3;
        
        
        String requestBody;
        serializeJson(doc, requestBody);
        
       
        int httpResponseCode = http.POST(requestBody);
        
        if (httpResponseCode > 0) {
          String response = http.getString();
          Serial.println("Response: " + response);
        } else {
          Serial.print("Error on sending POST: ");
          Serial.println(httpResponseCode);
        }
        
        http.end();
      } else {
        Serial.println("WiFi Disconnected");
      }
      
      lastHttpSendTime = currentTime;
    }
    
    lastSendTime = currentTime;
  }
}
