#include <Wire.h>
#include <LSM6.h>
#include <LIS3MDL.h>
#include <MadgwickAHRS.h>

LSM6 imu;
LIS3MDL mag;
Madgwick filter;

const int flexLittle = 14;
const int flexRing = 27;
const int flexMiddle = 26;
const int flexIndex = 25;
const int flexThumb = 33;

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
  delay(2000);
}

void loop() {
  if (Serial.available()) {
    char command = Serial.read();
    if (command == 's') {
      unsigned long startTime = millis();
      while (millis() - startTime < 1900) {
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
        Serial.print(millis() - startTime); Serial.print(",");
        Serial.print(fl); Serial.print(",");
        Serial.print(fr); Serial.print(",");
        Serial.print(fm); Serial.print(",");
        Serial.print(fi); Serial.print(",");
        Serial.print(ft); Serial.print(",");
        Serial.print(q0); Serial.print(",");
        Serial.print(q1); Serial.print(",");
        Serial.print(q2); Serial.print(",");
        Serial.println(q3);
      }
      Serial.println("#");
    }
  }
}
