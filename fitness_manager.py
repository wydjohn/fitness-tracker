import os
from dotenv import load_dotenv
import sqlite3
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')
conn = sqlite3.connect(DATABASE_URL)
cur = conn.cursor()

cur.execute('''CREATE TABLE IF NOT EXISTS workout_logs
               (id INTEGER PRIMARY KEY, date TEXT, activity TEXT, duration INTEGER, intensity TEXT)''')
conn.commit()

class WorkoutLogs:
    @staticmethod
    def create_log(date, activity, duration, intensity):
        cur.execute("INSERT INTO workout_logs (date, activity, duration, intensity) VALUES (?, ?, ?, ?)",
                    (date, activity, duration, intensity))
        conn.commit()
    
    @staticmethod
    def read_logs():
        cur.execute("SELECT * FROM workout_logs")
        return cur.fetchall()
    
    @staticmethod
    def update_log(log_id, date=None, activity=None, duration=None, intensity=None):
        query = "UPDATE workout_logs SET "
        params = []
        if date:
            query += "date = ?, "
            params.append(date)
        if activity:
            query += "activity = ?, "
            params.append(activity)
        if duration:
            query += "duration = ?, "
            params.append(duration)
        if intensity:
            query += "intensity = ? "
            params.append(intensity)
        query = query.strip(", ")
        query += " WHERE id = ?"
        params.append(log_id)
        cur.execute(query, tuple(params))
        conn.commit()
    
    @staticmethod
    def delete_log(log_id):
        cur.execute("DELETE FROM workout_logs WHERE id = ?", (log_id,))
        conn.commit()

class WorkoutAnalysis:
    @staticmethod
    def analyze_patterns():
        df = pd.read_sql_query("SELECT * FROM workout_logs", conn)
        print(df.describe())
    
    @staticmethod
    def suggest_workout_plan(user_data):
        df = pd.read_sql_query("SELECT * FROM workout_logs", conn)
        if len(df) < 10:  
            return "Insufficient data for personalized workout suggestions."
        
        df = pd.get_dummies(df, columns=['intensity'])  
        X = df.drop(['id', 'date', 'activity'], axis=1)
        y = df['activity']
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        clf = RandomForestClassifier(n_estimators=100)
        clf.fit(X_train, y_train)
        
        suggested_activity = clf.predict([user_data])
        return suggested_activity

if __name__ == "__main__":
    WorkoutLogs.create_log('2023-07-01', 'Running', 30, 'High')
    print("Log Created")
    print("Current Logs:", WorkoutLogs.read_logs())
    WorkoutLogs.update_log(1, activity='Cycling')
    print("After Update:", WorkoutLogs.read_logs())
    WorkoutAnalysis.analyze_patterns()
    user_data = [20, 0, 1, 0]  
    print("Suggested Activity:", WorkoutAnalysis.suggest_workout_plan(user_data))