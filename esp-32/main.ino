#include <Wire.h>
#include <LSM6.h>          // Pololu LSM6 library
#include <LIS3MDL.h>       // Pololu LIS3MDL library
#include <MadgwickAHRS.h>  // Madgwick sensor fusion

// Create sensor objects
LSM6 imu;
LIS3MDL mag;
Madgwick filter;

// ---------------
// User-defined magnetometer offsets (hard-iron)
// Replace with your actual values from calibration
// ---------------
const float MAG_X_OFFSET = 1638.0f;
const float MAG_Y_OFFSET = -2405.0f;
const float MAG_Z_OFFSET = -974.0f;

// ---------------
// Magnetometer scale
// For LIS3MDL at ±4 gauss: ~1/6842 => 0.000146 gauss/LSB
// ---------------
const float MAG_SCALE = 1.0f / 6842.0f;  // gauss/LSB for ±4 gauss range

// ---------------
// LSM6 default scales
// ---------------
// Accelerometer: ±2 g => 0.000061 g/LSB
// Gyroscope: ±245 dps => 0.00875 dps/LSB
// We convert dps -> rad/s by multiplying dps * DEG_TO_RAD

// ---------------
// Yaw offset (so sensor physically pointing north = 0°)
// We'll set it dynamically in loop() if we receive a 'z' over serial
// ---------------
float headingOffset = 0.0f;

void setup() {
  Serial.begin(115200);

  // Initialize I2C (ESP32: SDA=18, SCL=22)
  Wire.begin(18, 22);

  // Initialize LSM6 (accelerometer + gyro)
  if (!imu.init()) {
    Serial.println("Failed to detect LSM6!");
    while (1);
  }
  imu.enableDefault();

  // Initialize LIS3MDL (magnetometer)
  if (!mag.init()) {
    Serial.println("Failed to detect LIS3MDL!");
    while (1);
  }
  mag.enableDefault();

  // Start Madgwick filter
  // We'll assume ~100Hz in loop()
  filter.begin(100.0f);

  Serial.println("9DOF Madgwick Starting...");
  Serial.println("Send 'z' in Serial Monitor to set current heading to 0° (north).");
}

void loop() {
  // --------------------------------------------------------------------
  // 1) Read LSM6 (accel + gyro)
  // --------------------------------------------------------------------
  imu.read();

  // Convert raw accelerometer to 'g'
  float ax = imu.a.x * 0.000061f;
  float ay = imu.a.y * 0.000061f;
  float az = imu.a.z * 0.000061f;

  // Convert raw gyro to rad/s
  float gx = (imu.g.x * 0.00875f) * DEG_TO_RAD;
  float gy = (imu.g.y * 0.00875f) * DEG_TO_RAD;
  float gz = (imu.g.z * 0.00875f) * DEG_TO_RAD;

  // --------------------------------------------------------------------
  // 2) Read LIS3MDL (magnetometer)
  //    Apply hard-iron offset + scale
  // --------------------------------------------------------------------
  mag.read();

  float mx_corrected = (mag.m.x - MAG_X_OFFSET) * MAG_SCALE;
  float my_corrected = (mag.m.y - MAG_Y_OFFSET) * MAG_SCALE;
  float mz_corrected = (mag.m.z - MAG_Z_OFFSET) * MAG_SCALE;

  // --------------------------------------------------------------------
  // 3) Update Madgwick with the 9DOF data
  //    gyro in rad/s, accel in g, mag in gauss
  // --------------------------------------------------------------------
  filter.update(gx, gy, gz, ax, ay, az, mx_corrected, my_corrected, mz_corrected);

  // --------------------------------------------------------------------
  // 4) Compute Euler angles (deg)
  // --------------------------------------------------------------------
  float roll  = filter.getRoll();   // degrees
  float pitch = filter.getPitch();  // degrees
  float yaw   = filter.getYaw();    // degrees

  // --------------------------------------------------------------------
  // 5) Apply heading offset for 0° at your "north"
  // --------------------------------------------------------------------
  float yawCorrected = yaw - headingOffset;

  // Keep yawCorrected in [0, 360) range (optional)
  if (yawCorrected < 0) {
    yawCorrected += 360.0f;
  } else if (yawCorrected >= 360.0f) {
    yawCorrected -= 360.0f;
  }

  // --------------------------------------------------------------------
  // 6) Print angles
  // --------------------------------------------------------------------
  Serial.print("Roll: ");
  Serial.print(roll, 2);
  Serial.print("  Pitch: ");
  Serial.print(pitch, 2);
  Serial.print("  Yaw: ");
  Serial.println(yawCorrected, 2);

  // --------------------------------------------------------------------
  // 7) Check if user wants to "zero" heading to north
  // --------------------------------------------------------------------
  if (Serial.available() > 0) {
    char c = Serial.read();
    if (c == 'z') {
      // Set headingOffset so sensor's current yaw becomes 0
      headingOffset = yaw;  
      Serial.print("Setting heading offset = ");
      Serial.println(headingOffset, 2);
    }
  }

  // ~100Hz
  delay(10);
}
