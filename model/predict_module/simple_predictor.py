class SimpleGestureDetector:
    def __init__(self):
        self.flex_threshold = 1200
        self.buffer = []
        self.buffer_size = 5
        self.gesture_counts = {0: 0, 1: 0, 2: 0, 3: 0}
        self.count_threshold = 3
        
    def add_sample(self, sample):
        self.buffer.append(sample)
        if len(self.buffer) > self.buffer_size:
            self.buffer.pop(0)
    
    def is_finger_bent(self, value):
        return value < self.flex_threshold
    
    def get_gesture_from_pattern(self, fingers_bent):
        thumb_bent, index_bent, middle_bent, ring_bent, little_bent = fingers_bent
        
        if thumb_bent and index_bent and middle_bent and ring_bent and little_bent:
            return 3
        
        if thumb_bent and index_bent and not middle_bent and not ring_bent and not little_bent:
            return 1
            
        if thumb_bent and not index_bent and not middle_bent and ring_bent and little_bent:
            return 2
            
        return 0
    
    def predict(self, sample=None):
        if sample is not None:
            self.add_sample(sample)
            
        if len(self.buffer) < self.buffer_size:
            return -1
            
        current_gestures = []
        for sample in self.buffer:
            thumb_bent = self.is_finger_bent(sample[4])
            index_bent = self.is_finger_bent(sample[3])
            middle_bent = self.is_finger_bent(sample[2])
            ring_bent = self.is_finger_bent(sample[1])
            little_bent = self.is_finger_bent(sample[0])
            
            gesture = self.get_gesture_from_pattern([thumb_bent, index_bent, middle_bent, ring_bent, little_bent])
            current_gestures.append(gesture)
            
        counts = {0: 0, 1: 0, 2: 0, 3: 0}
        for gesture in current_gestures:
            counts[gesture] = counts.get(gesture, 0) + 1
            
        most_common_gesture = max(counts, key=counts.get)
        
        if counts[most_common_gesture] >= self.count_threshold:
            return most_common_gesture
        
        return 0


def parse_sensor_data(data):
    return [
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

gesture_detector = None

def initialize_detector():
    global gesture_detector
    gesture_detector = SimpleGestureDetector()

def predict_gesture(sensor_data):
    global gesture_detector
    
    if gesture_detector is None:
        initialize_detector()
    
    features = parse_sensor_data(sensor_data)
    prediction = gesture_detector.predict(features)
    
    return prediction 