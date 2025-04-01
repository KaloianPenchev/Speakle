from flask import Flask, request, jsonify
from flask_socketio import SocketIO
from flask_cors import CORS
import eventlet
import time
import threading
import os

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Dictionary mapping gesture IDs to their corresponding text phrases
gesture_mappings = {
    1: "Аз се казвам Калоян.",
    2: "Чао!",
    3: "Благодаря.",
    4: "Custom phrase"  # This could be customizable later
}

# Flag to control gesture detection thread
detection_active = False
detection_thread = None

def gesture_detection_simulation():
    """
    Simulates the gesture detection process.
    In a real implementation, this would use sensor data from the glove.
    """
    global detection_active
    while detection_active:
        # Wait for user input in the terminal
        print("\nGesture Detection Simulation")
        print("----------------------------")
        print("Select a gesture (1-4):")
        print("1: Аз се казвам Калоян.")
        print("2: Чао!")
        print("3: Благодаря.")
        print("4: Custom phrase")
        print("0: Exit simulation")
        
        try:
            gesture_id = int(input("Enter gesture ID: "))
            
            if gesture_id == 0:
                detection_active = False
                print("Gesture detection stopped.")
                break
                
            if 1 <= gesture_id <= 4:
                # Emit the detected gesture to the Node.js server
                print(f"Detected gesture: {gesture_id} - {gesture_mappings[gesture_id]}")
                socketio.emit('gestureDetected', {'gestureId': gesture_id, 'text': gesture_mappings[gesture_id]})
            else:
                print("Invalid gesture ID. Please enter a number between 1 and 4.")
                
        except ValueError:
            print("Please enter a valid number.")
        
        time.sleep(1)  # Small delay

@app.route('/')
def index():
    return jsonify({"status": "Flask Gesture Detection Server is running!"})

@app.route('/start_detection', methods=['POST'])
def start_detection():
    """Start the gesture detection simulation."""
    global detection_active, detection_thread
    
    if detection_active:
        return jsonify({"status": "Gesture detection is already running."})
    
    detection_active = True
    detection_thread = threading.Thread(target=gesture_detection_simulation)
    detection_thread.daemon = True
    detection_thread.start()
    
    return jsonify({"status": "Gesture detection started."})

@app.route('/stop_detection', methods=['POST'])
def stop_detection():
    """Stop the gesture detection simulation."""
    global detection_active
    
    if not detection_active:
        return jsonify({"status": "Gesture detection is not running."})
    
    detection_active = False
    return jsonify({"status": "Gesture detection stopped."})

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"Starting Flask server on port {port}")
    socketio.run(app, host='0.0.0.0', port=port, debug=True)
