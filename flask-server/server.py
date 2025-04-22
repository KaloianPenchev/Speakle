from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
import numpy as np
import sys
import os
import time
from collections import Counter, deque

sys.path.append(os.path.join(os.path.dirname(__file__), '../model/predict_module'))
from predictor import GesturePredictor
from simple_predictor import predict_gesture, initialize_detector

app = Flask(__name__)
CORS(app)

gesture_ids = {
    -1: "collecting_data",
    0: "scanning",
    1: "hello",
    2: "my_name_is",
    3: "bye"
}

latest_data = {
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
    'timestamp': time.time()
}

prediction_buffer = deque(maxlen=10)

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    
    if not data or not isinstance(data, dict):
        return jsonify({"error": "Invalid data format"}), 400
    
    input_data = {
        'flex_little': data.get('flex_little'),
        'flex_ring': data.get('flex_ring'),
        'flex_middle': data.get('flex_middle'),
        'flex_index': data.get('flex_index'),
        'flex_thumb': data.get('flex_thumb'),
        'quat_w': data.get('quat_w'),
        'quat_x': data.get('quat_x'),
        'quat_y': data.get('quat_y'),
        'quat_z': data.get('quat_z')
    }
    
    print("\n===== RECEIVED DATA =====")
    print(f"  Flex Little: {input_data['flex_little']}")
    print(f"  Flex Ring: {input_data['flex_ring']}")
    print(f"  Flex Middle: {input_data['flex_middle']}")
    print(f"  Flex Index: {input_data['flex_index']}")
    print(f"  Flex Thumb: {input_data['flex_thumb']}")
    print(f"  Quaternion W: {input_data['quat_w']}")
    print(f"  Quaternion X: {input_data['quat_x']}")
    print(f"  Quaternion Y: {input_data['quat_y']}")
    print(f"  Quaternion Z: {input_data['quat_z']}")
    
    global latest_data
    
    missing_values = []
    for key, value in input_data.items():
        if value is None:
            missing_values.append(key)
    
    if missing_values:
        print(f"WARNING: Missing values for: {', '.join(missing_values)}")
        print("Using default values from latest_data for prediction")
        for key in missing_values:
            input_data[key] = latest_data.get(key)
    
    try:
        prediction = predict_gesture(input_data)
        prediction_buffer.append(prediction)
        
        most_frequent = most_common(list(prediction_buffer))
        
        gesture_name = gesture_ids.get(most_frequent, "unknown")
        
        print(f"Predicted gesture: {prediction} ({gesture_ids.get(int(prediction), 'unknown')})")
        print(f"Most frequent gesture: {most_frequent} ({gesture_name})")
        print("===========================")
        
        latest_data = {
            'flex_little': input_data['flex_little'],
            'flex_ring': input_data['flex_ring'],
            'flex_middle': input_data['flex_middle'],
            'flex_index': input_data['flex_index'],
            'flex_thumb': input_data['flex_thumb'],
            'quat_w': input_data['quat_w'],
            'quat_x': input_data['quat_x'],
            'quat_y': input_data['quat_y'],
            'quat_z': input_data['quat_z'],
            'gesture_id': most_frequent,
            'gesture_name': gesture_name,
            'timestamp': time.time()
        }
        
        response = {
            "prediction": int(prediction),
            "prediction_name": gesture_ids.get(int(prediction), "unknown"),
            "most_frequent": most_frequent,
            "most_frequent_name": gesture_name,
            "success": True
        }
        
        return jsonify(response)
    
    except Exception as e:
        print(f"ERROR in prediction: {str(e)}")
        return jsonify({
            "error": str(e),
            "success": False
        }), 500

def most_common(lst):
    if not lst:
        return None
    counter = Counter(lst)
    most_common_item = counter.most_common(1)[0][0]
    return most_common_item

@app.route("/data", methods=["GET"])
def data():
    global latest_data
    response_data = dict(latest_data)
    response_data['server_time'] = time.time()
    return jsonify(response_data)

if __name__ == "__main__":
    templates_dir = os.path.join(os.path.dirname(__file__), 'templates')
    os.makedirs(templates_dir, exist_ok=True)
    
    try:
        print("Initializing gesture detector...")
        initialize_detector()
        print("Gesture detector initialized successfully")
    except Exception as e:
        print(f"WARNING: Error initializing detector: {str(e)}")
        print("Server will start anyway, but gesture recognition may not work")
    
    print("Server started! Access the interface at http://localhost:5001")
    import socket
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip_address = s.getsockname()[0]
        s.close()
        print(f"Local IP address for Arduino: {ip_address}")
        print(f"Update Arduino with: const char* serverUrl = \"http://{ip_address}:5001/predict\";")
    except:
        print("Could not determine IP address")
    
    app.run(host="0.0.0.0", port=5001)