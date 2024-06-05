import os
from dotenv import load_dotenv
import sqlite3
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

load_dotenv()

DATABASE_PATH = os.getenv('DATABASE_URL')
connection = sqlite3.connect(DATABASE_PATH)
cursor = connection.cursor()

cursor.execute('''CREATE TABLE IF NOT EXISTS workout_logs
               (id INTEGER PRIMARY KEY, date TEXT, activity TEXT, duration INTEGER, intensity TEXT)''')
connection.commit()

class WorkoutLogger:
    @staticmethod
    def add_workout_log(date, activity, duration, intensity):
        cursor.execute("INSERT INTO workout_logs (date, activity, duration, intensity) VALUES (?, ?, ?, ?)",
                    (date, activity, duration, intensity))
        connection.commit()
    
    @staticmethod
    def fetch_all_logs():
        cursor.execute("SELECT * FROM workout_logs")
        return cursor.fetchall()
    
    @staticmethod
    def modify_workout_log(log_id, date=None, activity=None, duration=None, intensity=None):
        update_query = "UPDATE workout_logs SET "
        parameters = []
        if date:
            update_query += "date = ?, "
            parameters.append(date)
        if activity:
            update_query += "activity = ?, "
            parameters.append(activity)
        if duration:
            update_query += "duration = ?, "
            parameters.append(duration)
        if intensity:
            update_query += "intensity = ? "
            parameters.append(intensity)
        update_query = update_query.rstrip(", ")
        update_query += " WHERE id = ?"
        parameters.append(log_id)
        cursor.execute(update_query, tuple(parameters))
        connection.commit()
    
    @staticmethod
    def remove_workout_log(log_id):
        cursor.execute("DELETE FROM workout_logs WHERE id = ?", (log_id,))
        connection.commit()

class WorkoutPredictor:
    @staticmethod
    def display_workout_data_summary():
        dataframe = pd.read_sql_query("SELECT * FROM workout_logs", connection)
        print(dataframe.describe())
    
    @staticmethod
    def recommend_workout_plan(input_features):
        dataframe = pd.read_sql_query("SELECT * FROM workout_logs", connection)
        if len(dataframe) < 10:  
            return "Insufficient data for personalized workout recommendations."
        
        dataframe = pd.get_dummies(dataframe, columns=['intensity'])  
        features = dataframe.drop(['id', 'date', 'activity'], axis=1)
        target = dataframe['activity']
        
        features_train, features_test, target_train, target_test = train_test_split(features, target, test_size=0.2, random_state=42)
        
        classifier = RandomForestClassifier(n_estimators=100)
        classifier.fit(features_train, target_train)
        
        recommended_activity = classifier.predict([input_features])
        return recommended_activity

if __name__ == "__main__":
    WorkoutLogger.add_workout_log('2023-07-01', 'Running', 30, 'High')
    print("Workout Log Added")
    print("All Workout Logs:", WorkoutLogger.fetch_all_logs())
    WorkoutLogger.modify_workout_log(1, activity='Cycling')
    print("Logs After Update:", WorkoutLogger.fetch_all_logs())
    WorkoutPredictor.display_workout_data_summary()
    input_for_prediction = [20, 0, 1, 0]  
    print("Recommended Workout Activity:", WorkoutPredictor.recommend_workout_plan(input_for_cameras))