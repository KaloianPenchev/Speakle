import os
import json
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv1D, MaxPooling1D, Dense, Dropout, Flatten, BatchNormalization, Normalization, AveragePooling1D
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
from tensorflow.keras.regularizers import l2
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import confusion_matrix, classification_report
from sklearn.utils.class_weight import compute_class_weight
import matplotlib.pyplot as plt
import seaborn as sns
from joblib import dump

def augment_time_series(sequences, labels, augmentation_factor=2):
    augmented_sequences = []
    augmented_labels = []
    
    for sequence, label in zip(sequences, labels):
        augmented_sequences.append(sequence)
        augmented_labels.append(label)
        
        for _ in range(augmentation_factor - 1):
            # Time warping (random stretching/compressing of segments)
            aug_seq = np.copy(sequence)
            seq_len = len(sequence)
            
            # Add significant noise
            noise_level = 0.15  # Increased noise
            aug_seq += np.random.normal(0, noise_level, aug_seq.shape)
            
            # Randomly scale amplitude in some dimensions
            scaling_dims = np.random.choice(aug_seq.shape[1], size=5, replace=False)  # More dimensions
            for dim in scaling_dims:
                scale_factor = np.random.uniform(0.8, 1.2)  # More aggressive scaling
                aug_seq[:, dim] *= scale_factor
            
            # Time shift (move the sequence slightly)
            shift = int(seq_len * 0.2)  # Larger shift
            if shift > 0:
                direction = np.random.choice([-1, 1])
                if direction > 0:
                    aug_seq = np.roll(aug_seq, shift, axis=0)
                    aug_seq[:shift] = aug_seq[shift]
                else:
                    aug_seq = np.roll(aug_seq, -shift, axis=0)
                    aug_seq[-shift:] = aug_seq[-shift-1]
            
            # Random feature masking (set random time steps to zero)
            if seq_len > 5:
                mask_length = np.random.randint(1, 5)
                start_idx = np.random.randint(0, seq_len - mask_length)
                aug_seq[start_idx:start_idx+mask_length, :] = 0
            
            augmented_sequences.append(aug_seq)
            augmented_labels.append(label)
    
    return augmented_sequences, augmented_labels

def load_dataset(csv_path, augment=True):
    df = pd.read_csv(csv_path)
    sequences = []
    labels = []
    
    for _, row in df.iterrows():
        flex_little = json.loads(row['flexLittle'])
        flex_ring = json.loads(row['flexRing'])
        flex_middle = json.loads(row['flexMiddle'])
        flex_index = json.loads(row['flexIndex'])
        flex_thumb = json.loads(row['flexThumb'])
        quat_w = json.loads(row['quatW'])
        quat_x = json.loads(row['quatX'])
        quat_y = json.loads(row['quatY'])
        quat_z = json.loads(row['quatZ'])
        
        sequence_length = len(flex_little)
        sequence = np.zeros((sequence_length, 9))
        
        for i in range(sequence_length):
            sequence[i, 0] = flex_little[i]
            sequence[i, 1] = flex_ring[i]
            sequence[i, 2] = flex_middle[i]
            sequence[i, 3] = flex_index[i]
            sequence[i, 4] = flex_thumb[i]
            sequence[i, 5] = quat_w[i]
            sequence[i, 6] = quat_x[i]
            sequence[i, 7] = quat_y[i]
            sequence[i, 8] = quat_z[i]
        
        sequences.append(sequence)
        labels.append(row['gesture'])
    
    if augment:
        sequences, labels = augment_time_series(sequences, labels, augmentation_factor=5)  # More augmentation
        print(f"Data augmentation applied: {len(sequences)} sequences after augmentation")
    
    return sequences, labels

def preprocess_data(sequences, labels):
    max_length = max(len(seq) for seq in sequences)
    
    X_padded = np.zeros((len(sequences), max_length, sequences[0].shape[1]))
    for i, seq in enumerate(sequences):
        X_padded[i, -len(seq):] = seq
    
    scaler = StandardScaler()
    X_reshaped = X_padded.reshape(-1, X_padded.shape[2])
    X_scaled = scaler.fit_transform(X_reshaped)
    X_scaled = X_scaled.reshape(X_padded.shape)
    
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(labels)
    
    return X_scaled, y_encoded, max_length, scaler, label_encoder

def create_model(input_shape, num_classes):
    model = Sequential()
    
    model.add(Normalization(input_shape=input_shape))
    
    model.add(AveragePooling1D(pool_size=2))
    
    model.add(Conv1D(8, kernel_size=7, activation='relu', padding='same', 
                    kernel_regularizer=l2(0.01))) 
    model.add(BatchNormalization())
    model.add(Dropout(0.6)) 
    
    model.add(AveragePooling1D(pool_size=2))
    
    model.add(Flatten())
    
    model.add(Dense(16, activation='relu', kernel_regularizer=l2(0.01)))
    model.add(BatchNormalization())
    model.add(Dropout(0.6)) 
    
    model.add(Dense(num_classes, activation='softmax', kernel_regularizer=l2(0.01)))
    
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.0002),  
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

def plot_training_history(history):
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 5))
    
    ax1.plot(history.history['accuracy'])
    ax1.plot(history.history['val_accuracy'])
    ax1.set_title('Model Accuracy')
    ax1.set_ylabel('Accuracy')
    ax1.set_xlabel('Epoch')
    ax1.legend(['Train', 'Validation'], loc='upper left')
    
    ax2.plot(history.history['loss'])
    ax2.plot(history.history['val_loss'])
    ax2.set_title('Model Loss')
    ax2.set_ylabel('Loss')
    ax2.set_xlabel('Epoch')
    ax2.legend(['Train', 'Validation'], loc='upper left')
    
    plt.tight_layout()
    plt.savefig(os.path.join(os.path.dirname(__file__), 'saved_model', 'training_history.png'))
    plt.close()

def plot_confusion_matrix(y_true, y_pred, class_names):
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=class_names, yticklabels=class_names)
    plt.title('Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.savefig(os.path.join(os.path.dirname(__file__), 'saved_model', 'confusion_matrix.png'))
    plt.close()

def plot_model_architecture(model, filename):
    try:
        tf.keras.utils.plot_model(
            model,
            to_file=filename,
            show_shapes=True,
            show_layer_names=True,
            rankdir='TB',
            dpi=96
        )
        print(f"Model architecture visualization saved to {filename}")
    except ImportError:
        print("Skipping model visualization - pydot and/or graphviz not installed.")
        print("To enable model visualization, run: pip install pydot")
        print("And install graphviz from: https://graphviz.gitlab.io/download/")

def main():
    tf.random.set_seed(42)
    np.random.seed(42)
    
    dataset_dir = os.path.join(os.path.dirname(__file__), 'dataset')
    saved_model_dir = os.path.join(os.path.dirname(__file__), 'saved_model')
    
    os.makedirs(saved_model_dir, exist_ok=True)
    
    csv_path = os.path.join(dataset_dir, 'collected_data.csv')
    
    sequences, labels = load_dataset(csv_path, augment=True)
    X, y, max_length, scaler, label_encoder = preprocess_data(sequences, labels)
    
    class_names = label_encoder.classes_
    num_classes = len(class_names)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.4, random_state=42, stratify=y)
    
    unique_classes = np.unique(y_train)
    class_weights = compute_class_weight(class_weight='balanced', classes=unique_classes, y=y_train)
    class_weight_dict = {i: weight for i, weight in zip(unique_classes, class_weights)}
    print(f"Class weights: {class_weight_dict}")
    
    model = create_model((max_length, X.shape[2]), num_classes)
    
    model.summary()
    
    plot_model_architecture(model, os.path.join(saved_model_dir, 'model_architecture.png'))
    
    callbacks = [
        EarlyStopping(monitor='val_accuracy', patience=10, restore_best_weights=True, 
                     mode='max', min_delta=0.01),
        ModelCheckpoint(
            filepath=os.path.join(saved_model_dir, 'gesture_model.h5'),
            save_best_only=True,
            monitor='val_accuracy',
            mode='max'
        ),
        ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=5, min_lr=0.00001)
    ]
    
    history = model.fit(
        X_train, y_train,
        epochs=50,  
        batch_size=16,  
        validation_split=0.3,  
        callbacks=callbacks,
        class_weight=class_weight_dict
    )
    
    test_loss, test_acc = model.evaluate(X_test, y_test)
    print(f'Test accuracy: {test_acc:.4f}')
    
    y_pred = np.argmax(model.predict(X_test), axis=1)
    
    print(classification_report(y_test, y_pred))
    
    plot_training_history(history)
    plot_confusion_matrix(y_test, y_pred, class_names)
    
    model_params = {
        'max_length': max_length,
        'num_features': X.shape[2],
        'num_classes': num_classes
    }
    
    with open(os.path.join(saved_model_dir, 'model_params.json'), 'w') as f:
        json.dump(model_params, f)
    
    model.save(os.path.join(saved_model_dir, 'gesture_model.keras'), save_format='keras')
    
    dump(scaler, os.path.join(dataset_dir, 'feature_scaler.joblib'))
    
    class_mapping = {
        'classes': class_names.tolist()
    }
    
    with open(os.path.join(dataset_dir, 'label_encoder.json'), 'w') as f:
        json.dump(class_mapping, f)
    
    print('Model training completed and saved successfully.')

if __name__ == '__main__':
    main()
