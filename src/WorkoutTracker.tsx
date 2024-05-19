import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import './WorkoutTracker.css';

interface Workout {
  id: number;
  type: string;
  duration: number;
  intensity: string;
  date: string;
}

interface WorkoutInput {
  type: string;
  duration: string;
  intensity: string;
}

const WorkoutTracker: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [newWorkout, setNewWorkout] = useState<WorkoutInput>({ type: '', duration: '', intensity: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewWorkout({ ...newWorkout, [e.target.name]: e.target.value });
  };

  const addWorkout = () => {
    const newEntry = {
      id: workouts.length + 1,
      type: newWorkout.type,
      duration: parseInt(newWorkout.duration),
      intensity: newWorkout.intensity,
      date: new Date().toLocaleDateString(),
    };

    if (newEntry.type && newEntry.duration > 0) {
      setWorkouts([...workouts, newEntry]);
    }
  };

  const renderChart = () => {
    return (
      <LineChart width={600} height={300} data={workouts}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <CartesianGrid stroke="#f5f5f5" />
        <Line type="monotone" dataKey="duration" stroke="#ff7300" yAxisId={0} />
        <Legend />
      </LineChart>
    );
  };

  return (
    <div className="workout-tracker">
      <h2>Workout Tracker</h2>
      <div className="workout-inputs">
        <input
          type="text"
          name="type"
          placeholder="Workout Type"
          value={newWorkout.type}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="duration"
          placeholder="Duration (in minutes)"
          value={newWorkout.duration}
          onChange={handleInputChange}
        />
        <select name="intensity" value={newWorkout.intensity} onChange={handleInputChange}>
          <option value="">Select Intensity</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <button onClick={addWorkout}>Add Workout</button>
      </div>
      <div className="workout-progress">
        {workouts.length > 0 ? renderChart() : <p>No workouts logged yet.</p>}
      </div>
    </div>
  );
};

export default WorkoutTracker;