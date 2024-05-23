import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import './WorkoutTracker.css';

interface Workout {
  id: number;
  type: string;
  duration: number;
  intensity: string;
  date: string;
}

interface NewWorkoutData {
  type: string;
  duration: string;
  intensity: string;
}

const WorkoutTracker: React.FC = () => {
  const [workoutLogs, setWorkoutLogs] = useState<Workout[]>([]);
  const [workoutFormData, setWorkoutFormData] = useState<NewWorkoutData>({ type: '', duration: '', intensity: '' });

  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setWorkoutFormData({ ...workoutFormData, [e.target.name]: e.target.value });
  };

  const handleAddWorkout = () => {
    const newWorkout = {
      id: workoutLogs.length + 1,
      type: workoutFormData.type,
      duration: parseInt(workoutFormData.duration),
      intensity: workoutFormData.intensity,
      date: new Date().toLocaleDateString(),
    };

    if (newWorkout.type && newWorkout.duration > 0) {
      setWorkoutLogs([...workoutLogs, newWorkout]);
    }
  };

  // Using useMemo to only re-calculate the chart when workoutLogs changes
  const workoutProgressChart = useMemo(() => {
    return (
      <LineChart width={600} height={300} data={workoutLogs}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <CartesianGrid stroke="#f5f5f5" />
        <Line type="monotone" dataKey="duration" stroke="#ff7300" yAxisId={0} />
        <Legend />
      </LineChart>
    );
  }, [workoutLogs]); // Dependency array, useMemo will only recompute if workoutLogs changes

  return (
    <div className="workout-tracker">
      <h2>Workout Tracker</h2>
      <div className="workout-form">
        <input
          type="text"
          name="type"
          placeholder="Workout Type"
          value={workoutFormData.type}
          onChange={handleFormInputChange}
        />
        <input
          type="number"
          name="duration"
          placeholder="Duration (in minutes)"
          value={workoutFormData.duration}
          onChange={handleFormInputChange}
        />
        <select name="intensity" value={workoutFormData.intensity} onChange={handleFormInputChange}>
          <option value="">Select Intensity</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <button onClick={handleAddWorkout}>Add Workout</button>
      </div>
      <div className="workout-chart">
        {workoutLogs.length > 0 ? workoutProgressChart : <p>No workouts logged yet.</p>}
      </div>
    </div>
  );
};

export default WorkoutTracker;