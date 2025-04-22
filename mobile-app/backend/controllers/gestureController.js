const { response } = require('express');
const { predict_gesture } = require('../utils/predict_module/simple_predictor');
const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const tempDir = path.join(__dirname, '..', 'temp_audio');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}


const gestureIds = {
    '-1': "collecting_data",
    '0': "scanning",
    '1': "hello",
    '2': "my_name_is",
    '3': "bye"
};


let latestData = {
    'flex_little': 1500,
    'flex_ring': 1500,
    'flex_middle': 1500,
    'flex_index': 1500,
    'flex_thumb': 1500,
    'quat_w': 1.0,
    'quat_x': 0.0,
    'quat_y': 0.0,
    'quat_z': 0.0,
    'gesture_id': 0,
    'gesture_name': 'scanning',
    'timestamp': Date.now()
};


const predictionBuffer = [];
const MAX_BUFFER_SIZE = 10;


const mostCommon = (arr) => {
    if (!arr || arr.length === 0) return null;
    
    const counter = {};
    let maxCount = 0;
    let mostCommonItem = null;
    
    for (const item of arr) {
        if (!counter[item]) counter[item] = 0;
        counter[item]++;
        
        if (counter[item] > maxCount) {
            maxCount = counter[item];
            mostCommonItem = item;
        }
    }
    
    return mostCommonItem;
};


exports.predictGesture = (req, res) => {
    const data = req.body;
    
    if (!data || typeof data !== 'object') {
        return res.status(400).json({ error: "Invalid data format", success: false });
    }
    
    
    const inputData = {
        'flex_little': data.flex_little,
        'flex_ring': data.flex_ring,
        'flex_middle': data.flex_middle,
        'flex_index': data.flex_index,
        'flex_thumb': data.flex_thumb,
        'quat_w': data.quat_w,
        'quat_x': data.quat_x,
        'quat_y': data.quat_y,
        'quat_z': data.quat_z
    };
    
    
    console.log("\n===== RECEIVED DATA =====");
    console.log(`  Flex Little: ${inputData.flex_little}`);
    console.log(`  Flex Ring: ${inputData.flex_ring}`);
    console.log(`  Flex Middle: ${inputData.flex_middle}`);
    console.log(`  Flex Index: ${inputData.flex_index}`);
    console.log(`  Flex Thumb: ${inputData.flex_thumb}`);
    console.log(`  Quaternion W: ${inputData.quat_w}`);
    console.log(`  Quaternion X: ${inputData.quat_x}`);
    console.log(`  Quaternion Y: ${inputData.quat_y}`);
    console.log(`  Quaternion Z: ${inputData.quat_z}`);
    
    // Check if any required values are missing
    const missingValues = [];
    for (const [key, value] of Object.entries(inputData)) {
        if (value === undefined) {
            missingValues.push(key);
        }
    }
    
    if (missingValues.length > 0) {
        console.log(`WARNING: Missing values for: ${missingValues.join(', ')}`);
        console.log("Using default values from latestData for prediction");
        
        
        missingValues.forEach(key => {
            inputData[key] = latestData[key];
        });
    }
    
    try {
        
        const prediction = predict_gesture(inputData);
        
        
        predictionBuffer.push(prediction);
        if (predictionBuffer.length > MAX_BUFFER_SIZE) {
            predictionBuffer.shift(); 
        }
        
        
        const mostFrequent = mostCommon(predictionBuffer);
        const gestureName = gestureIds[mostFrequent] || "unknown";
        
        
        console.log(`Predicted gesture: ${prediction} (${gestureIds[prediction] || 'unknown'})`);
        console.log(`Most frequent gesture: ${mostFrequent} (${gestureName})`);
        console.log("===========================");
        
        
        latestData = {
            'flex_little': inputData.flex_little,
            'flex_ring': inputData.flex_ring,
            'flex_middle': inputData.flex_middle,
            'flex_index': inputData.flex_index,
            'flex_thumb': inputData.flex_thumb,
            'quat_w': inputData.quat_w,
            'quat_x': inputData.quat_x,
            'quat_y': inputData.quat_y,
            'quat_z': inputData.quat_z,
            'gesture_id': mostFrequent,
            'gesture_name': gestureName,
            'timestamp': Date.now()
        };
        
        
        const response = {
            "prediction": parseInt(prediction),
            "prediction_name": gestureIds[prediction] || "unknown",
            "most_frequent": mostFrequent,
            "most_frequent_name": gestureName,
            "success": true
        };
        
        return res.json(response);
        
    } catch (error) {
        console.log(`ERROR in prediction: ${error.message}`);
        return res.status(500).json({
            error: error.message,
            success: false
        });
    }
};


exports.getLatestData = (req, res) => {
    const responseData = { ...latestData, server_time: Date.now() };
    return res.json(responseData);
};

exports.speakCurrentGesture = async (req, res) => {
    try {
        if (latestData.gesture_id === 0 || latestData.gesture_name === 'scanning') {
            return res.status(200).json({ 
                success: true, 
                message: 'No active gesture detected',
                speak: false
            });
        }
        
        const gestureName = latestData.gesture_name;
        let textToSpeak = '';
        
        if (gestureName === 'hello') {
            textToSpeak = 'Hello';
        } else if (gestureName === 'my_name_is') {
            textToSpeak = 'My name is';
        } else if (gestureName === 'bye') {
            textToSpeak = 'Goodbye';
        } else {
            textToSpeak = gestureName;
        }
        
        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: "alloy",
            input: textToSpeak,
            response_format: "mp3",
        });
        
        const speechFile = path.join(tempDir, `speech_${Date.now()}.mp3`);
        const buffer = Buffer.from(await mp3.arrayBuffer());
        await fs.promises.writeFile(speechFile, buffer);
        
        const audioBase64 = buffer.toString('base64');
        
        try {
            await fs.promises.unlink(speechFile);
        } catch (cleanupError) {
            console.error(`Error deleting temporary file ${speechFile}:`, cleanupError);
        }
        
        return res.status(200).json({
            success: true,
            gesture: gestureName,
            text: textToSpeak,
            audioBase64: audioBase64,
            format: 'mp3',
            speak: true
        });
        
    } catch (error) {
        console.error('Error generating speech for gesture:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to generate speech',
            details: error.message
        });
    }
}; 