import os
import json
import numpy as np
from tensorflow.keras.models import load_model
import pandas as pd
from joblib import load

class GesturePredictor:
    def __init__(self):
        model_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'saved_model')
        dataset_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'dataset')
        
        with open(os.path.join(model_dir, 'model_params.json'), 'r') as f:
            self.model_params = json.load(f)
        
        with open(os.path.join(dataset_dir, 'label_encoder.json'), 'r') as f:
            self.class_mapping = json.load(f)['classes']
        
        self.model = load_model(os.path.join(model_dir, 'gesture_model.keras'))
        self.max_length = self.model_params['max_length']
        self.scaler = load(os.path.join(dataset_dir, 'feature_scaler.joblib'))
        
        self.buffer = []
        self.buffer_size = 15
        self.prediction_history = []
        self.prediction_window = 5
        self.confidence_threshold = 0.85
        
    def add_sample(self, sample):
        self.buffer.append(sample)
        
        if len(self.buffer) > self.max_length:
            self.buffer = self.buffer[-self.max_length:]
    
    def predict(self, sample=None):
        if sample is not None:
            self.add_sample(sample)
        
        if len(self.buffer) < self.buffer_size:
            return -1
        
        X = np.array(self.buffer)
        
        X_reshaped = X.reshape(-1, X.shape[1])
        X_scaled = self.scaler.transform(X_reshaped)
        X_scaled = X_scaled.reshape(X.shape)
        
        if len(X_scaled) < self.max_length:
            padded = np.zeros((self.max_length, X_scaled.shape[1]))
            padded[-len(X_scaled):] = X_scaled
            X_scaled = padded
        else:
            X_scaled = X_scaled[-self.max_length:]
        
        X_scaled = X_scaled.reshape(1, self.max_length, X_scaled.shape[1])
        
        y_pred = self.model.predict(X_scaled, verbose=0)[0]
        
        pred_class = np.argmax(y_pred)
        confidence = y_pred[pred_class]
        
        self.prediction_history.append((pred_class, confidence))
        if len(self.prediction_history) > self.prediction_window:
            self.prediction_history.pop(0)
        
        if len(self.prediction_history) == self.prediction_window:
            pred_counts = {}
            avg_confidence = {}
            
            for p, c in self.prediction_history:
                pred_counts[p] = pred_counts.get(p, 0) + 1
                avg_confidence[p] = avg_confidence.get(p, 0) + c
            
            for p in avg_confidence:
                avg_confidence[p] /= pred_counts[p]
            
            most_common = max(pred_counts.items(), key=lambda x: x[1])
            most_common_class = most_common[0]
            most_common_count = most_common[1]
            most_common_confidence = avg_confidence[most_common_class]
            
            if most_common_count < 3 or most_common_confidence < self.confidence_threshold:
                return 0
            
            return most_common_class + 1
            
        if confidence < self.confidence_threshold:
            return 0
        
        return pred_class + 1

def parse_sensor_data(data):
    features = [
        data['flex_little'],
        data['flex_ring'],
        data['flex_middle'],
        data['flex_index'],
        data['flex_thumb'],
        data['quat_w'],
        data['quat_x'],
        data['quat_y'],
        data['quat_z']
    ]
    return np.array(features)

gesture_predictor = None

def initialize_predictor():
    global gesture_predictor
    gesture_predictor = GesturePredictor()

def predict_gesture(sensor_data):
    global gesture_predictor
    
    if gesture_predictor is None:
        initialize_predictor()
    
    features = parse_sensor_data(sensor_data)
    prediction = gesture_predictor.predict(features)
    
    return prediction 