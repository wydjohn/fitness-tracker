import os
from dotenv import load_dotenv
import sqlite3
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

load_dotenv()

DB_PATH = os.getenv('DATABASE_URL')

class DBContextManager:
    def __enter__(self):
        self.conn = sqlite3.connect(DB_PATH)
        return self.conn.cursor()
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.conn.commit()
        self.conn.close()

def initialize_database():
    with DBContextManager() as cursor:
        cursor.execute('''CREATE TABLE IF NOT EXISTS workout_logs
                       (id INTEGER PRIMARY KEY, date TEXT, activity TEXT, duration INTEGER, intensity TEXT)''')

class LogHandler:
    @staticmethod
    def add_log(date, activity, duration, intensity):
        with DBContextManager() as cursor:
            cursor.execute("INSERT INTO workout_logs (date, activity, duration, intensity) VALUES (?, ?, ?, ?)",
                        (date, activity, duration, intensity))
    
    @staticmethod
    def get_all_logs():
        with DBContextManager() as cursor:
            cursor.execute("SELECT * FROM workout_logs")
            return cursor.fetchall()
    
    @staticmethod
    def update_log(log_id, date=None, activity=None, duration=None, intensity=None):
        base_query = "UPDATE workout_logs SET "
        params = []
        if date:
            base_query += "date = ?, "
            params.append(date)
        if activity:
            base_query += "activity = ?, "
            params.append(activity)
        if duration:
            base_query += "duration = ?, "
            params.append(duration)
        if intensity:
            base_query += "intensity = ? "
            params.append(intensity)
        base_query = base_query.rstrip(", ")
        base_query += " WHERE id = ?"
        params.append(log_id)
        with DBContextManager() as cursor:
            cursor.execute(base_query, tuple(params))
    
    @staticmethod
    def delete_log(log_id):
        with DBContextManager() as cursor:
            cursor.execute("DELETE FROM workout_logs WHERE id = ?", (log_id,))

class ActivityPredictor:
    @staticmethod
    def summarize_data():
        with DBContextManager() as cursor:
            df = pd.read_sql_query("SELECT * FROM workout_logs", cursor.connection)
            print(df.describe())
    
    @staticmethod
    def suggest_activity_plan(input_features):
        with DBContextManager() as cursor:
            df = pd.read_sql_query("SELECT * FROM workout_logs", cursor.connection)
            if len(df) < 10:  
                return "Insufficient data for personalized recommendations."
            
            df = pd.get_dummies(df, columns=['intensity'])  
            features = df.drop(['id', 'date', 'activity'], axis=1)
            target = df['activity']
        
            X_train, X_test, y_train, y_test = train_test_split(features, target, test_size=0.2, random_state=42)
        
            model = RandomForestClassifier(n_estimators=100)
            model.fit(X_train, y_train)
        
            suggested_activity = model.predict([input_features])
            return suggested_activity

    @staticmethod
    def highlight_popular_activities():
        with DBContextManager() as cursor:
            query = '''
            SELECT activity, intensity, COUNT(activity) as frequency 
            FROM workout_logs 
            GROUP BY activity, intensity
            ORDER BY frequency DESC
            LIMIT 3
            '''
            cursor.execute(query)
            popular_activities = cursor.fetchall()
            print("Top Activities & Intensities:\n", popular_activities)

def collect_user_input():
    print("Enter workout log details")
    date = input("Date (YYYY-MM-DD): ")
    activity = input("Activity: ")
    duration = input("Duration (in minutes): ")
    intensity = input("Intensity (Low/Medium/High): ")
    return date, activity, duration, intensity

if __name__ == "__main__":
    initialize_database()
    while True:
        choice = input("Choose an option: [1] Add Log [2] Data Summary [3] Popular Activities [4] Exit: ")
        if choice == "1":
            date, activity, duration, intensity = collect_user_input()
            LogHandler.add_log(date, activity, duration, intensity)
            print("Log Successfully Added")
        elif choice == "2":
            ActivityPredictor.summarize_data()
        elif choice == "3":
            ActivityPredictor.highlight_popular_activities()
        elif choice == "4":
            print("Goodbye.")
            break
        else:
            print("Invalid option, please try again.")