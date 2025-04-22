class SimpleGestureDetector {
    constructor() {
        this.flex_threshold = 1200;
        this.buffer = [];
        this.buffer_size = 5;
        this.gesture_counts = { 0: 0, 1: 0, 2: 0, 3: 0 };
        this.count_threshold = 3;
    }

    add_sample(sample) {
        this.buffer.push(sample);
        if (this.buffer.length > this.buffer_size) {
            this.buffer.shift();
        }
    }

    is_finger_bent(value) {
        return value < this.flex_threshold;
    }

    get_gesture_from_pattern(fingers_bent) {
        const [thumb_bent, index_bent, middle_bent, ring_bent, little_bent] = fingers_bent;

        if (thumb_bent && index_bent && middle_bent && ring_bent && little_bent) {
            return 3;
        }

        if (thumb_bent && index_bent && !middle_bent && !ring_bent && !little_bent) {
            return 1;
        }

        if (thumb_bent && !index_bent && !middle_bent && ring_bent && little_bent) {
            return 2;
        }

        return 0;
    }

    predict(sample = null) {
        if (sample !== null) {
            this.add_sample(sample);
        }

        if (this.buffer.length < this.buffer_size) {
            return -1;
        }

        const current_gestures = [];
        for (const sample of this.buffer) {
            const thumb_bent = this.is_finger_bent(sample[4]);
            const index_bent = this.is_finger_bent(sample[3]);
            const middle_bent = this.is_finger_bent(sample[2]);
            const ring_bent = this.is_finger_bent(sample[1]);
            const little_bent = this.is_finger_bent(sample[0]);

            const gesture = this.get_gesture_from_pattern([thumb_bent, index_bent, middle_bent, ring_bent, little_bent]);
            current_gestures.push(gesture);
        }

        const counts = { 0: 0, 1: 0, 2: 0, 3: 0 };
        for (const gesture of current_gestures) {
            counts[gesture] = (counts[gesture] || 0) + 1;
        }

        let most_common_gesture = 0;
        let max_count = 0;
        for (const [gesture, count] of Object.entries(counts)) {
            if (count > max_count) {
                max_count = count;
                most_common_gesture = parseInt(gesture);
            }
        }

        if (counts[most_common_gesture] >= this.count_threshold) {
            return most_common_gesture;
        }

        return 0;
    }
}

function parseSensorData(data) {
    return [
        data.flex_little,
        data.flex_ring,
        data.flex_middle,
        data.flex_index,
        data.flex_thumb,
        data.quat_w,
        data.quat_x,
        data.quat_y,
        data.quat_z
    ];
}

let gestureDetector = null;

function initialize_detector() {
    gestureDetector = new SimpleGestureDetector();
}

function predict_gesture(sensorData) {
    if (!gestureDetector) {
        initialize_detector();
    }

    const features = parseSensorData(sensorData);
    const prediction = gestureDetector.predict(features);
    
    return prediction.toString();
}

module.exports = {
    initialize_detector,
    predict_gesture
}; 