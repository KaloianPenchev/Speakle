# Speakle

## Project Overview

Speakle is a smart glove designed to bridge the communication gap for the deaf community by translating sign language into spoken voice and converting speech to text. Its mission is to enable seamless interaction between deaf individuals and the hearing world through innovative hardware and advanced machine learning.

The project consists of three key components:

- **Mobile App**: User-friendly interface for conversation and settings
- **Python Server & Language Model**: Processes gesture data and handles language conversion
- **Smart Glove Hardware**: Captures precise hand movements and gestures

## Technologies

### Mobile App
- **Framework**: React Native with Expo
- **Backend**: Node.js and Express.js

### Python Server & Language Model
- **Framework**: Flask
- **Machine Learning**: TensorFlow, custom Convolutional Neural Network (CNN)
- **Language Processing**: GPT model for text-to-speech (TTS) and speech-to-text (STT)

### Smart Glove Hardware
- **Microcontroller**: ESP32
- **Sensors**: 9-axis IMU, 5 flex sensors

### Data Management
- **Database**: Supabase for secure storage of sensor data and communication logs

## How it Works

1. **Sensor Data Acquisition**
   - The smart glove collects real-time data from its integrated sensors
   - Flex sensors capture finger positions while IMU tracks hand orientation

2. **Data Transmission**
   - Captured sensor data is sent to the Flask server for processing
   - Communication occurs wirelessly from the glove to the mobile device

3. **Gesture Recognition**
   - The server utilizes a custom CNN with softmax activation to identify specific gestures
   - The model is trained on 3-5 gestures derived from the Austro-Hungarian gesture system, with focus on Bulgarian Sign Language

4. **Mobile App Trigger**
   - The app is activated only when the model is highly confident in its recognition
   - Unrecognized gestures result in no action, preventing false triggers

5. **Voice and Text Conversion**
   - Upon successful gesture recognition, a GPT model converts the input into spoken voice via TTS
   - Optional STT feature provides additional communication support by converting spoken responses to text

