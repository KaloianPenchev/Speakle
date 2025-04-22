import serial
import csv
import os
import time
import json 

def collect_data(port='COM8', baudrate=115200, dataset_file='dataset_correct_format.csv'):
    person_id = 2
    gesture_name = "bye"

    file_exists = os.path.exists(dataset_file)

    with open(dataset_file, mode='a', newline='', encoding='utf-8') as file:
        writer = csv.writer(file, quotechar='"', quoting=csv.QUOTE_MINIMAL)

        if not file_exists:
            writer.writerow([
                "ID_person", "gesture", "repetition",
                "time", 
                "flexLittle", "flexRing", "flexMiddle", "flexIndex", "flexThumb",
                "quatW", "quatX", "quatY", "quatZ"
            ])
            print(f"Created new dataset file: {dataset_file}")
        else:
             print(f"Appending to existing dataset file: {dataset_file}")

        ser = serial.Serial(port, baudrate, timeout=1)
        print(f"Opened serial port {port}. Waiting for Arduino...")
        time.sleep(3)
        repetition = 1 

        while True:
            input("Press Enter to record next repetition...")
            ser.write(b's') 

            buffer = []

            while True:
                try:
                    line = ser.readline().decode('utf-8').strip()
                except UnicodeDecodeError:
                     print("Warning: Could not decode line from serial, skipping.")
                     continue 

                if line == '#':
                    if buffer:
                        time_list = []
                        flexLittle_list = []
                        flexRing_list = []
                        flexMiddle_list = []
                        flexIndex_list = []
                        flexThumb_list = []
                        quatW_list = []
                        quatX_list = []
                        quatY_list = []
                        quatZ_list = []

                        valid_repetition = True
                        for i, row_str in enumerate(buffer):
                             values = row_str.split(',')
                             if len(values) == 10:
                                 try:
                                     time_list.append(int(values[0]))
                                     flexLittle_list.append(int(values[1]))
                                     flexRing_list.append(int(values[2]))
                                     flexMiddle_list.append(int(values[3]))
                                     flexIndex_list.append(int(values[4]))
                                     flexThumb_list.append(int(values[5]))
                                     quatW_list.append(float(values[6]))
                                     quatX_list.append(float(values[7]))
                                     quatY_list.append(float(values[8]))
                                     quatZ_list.append(float(values[9]))
                                 except ValueError as e:
                                     print(f"Warning: Error parsing values in line {i} of buffer: {e}. Skipping repetition.")
                                     valid_repetition = False
                                     break
                             else:
                                 print(f"Warning: Incorrect number of values ({len(values)}) in line {i} of buffer. Skipping repetition.")
                                 valid_repetition = False
                                 break 
                        
                        if valid_repetition:
                            row_to_write = [
                                person_id, gesture_name, repetition,
                                json.dumps(time_list),
                                json.dumps(flexLittle_list), 
                                json.dumps(flexRing_list), 
                                json.dumps(flexMiddle_list), 
                                json.dumps(flexIndex_list), 
                                json.dumps(flexThumb_list),
                                json.dumps(quatW_list), 
                                json.dumps(quatX_list), 
                                json.dumps(quatY_list), 
                                json.dumps(quatZ_list)
                            ]
                            writer.writerow(row_to_write)
                            print(f"Saved repetition {repetition} ({len(time_list)} steps)")
                            repetition += 1
                        else:
                            print("Repetition data was invalid and not saved.")
                    else:
                         print("End signal '#' received, but buffer was empty. No data saved for this attempt.")
                         
                    break 

                elif line:
                    buffer.append(line)

    ser.close()
    print("Serial port closed.")

if __name__ == "__main__":
    dataset_dir = os.path.join(os.path.dirname(__file__), 'dataset')
    os.makedirs(dataset_dir, exist_ok=True)
    
    dataset_path = os.path.join(dataset_dir, 'collected_data.csv')
    
    collect_data(dataset_file=dataset_path)
