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
  const [filterType, setFilterType] = useState<string>('');

  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setWorkoutFormData({ ...workoutFormData, [e.target.name]: e.target.value });
  };

  const handleAddWorkout = () => {
    const newWorkout = {
      id: workoutLogs.length + 1,
      type: workoutFormData.type,
      duration: parseInt(workoutFormData.duration),
      intensity: workoutFormData.intensity,
      date: new Date().toISOString(), // Changed to ISOString for better sorting
    };

    if (newWorkout.type && newWorkout.duration > 0) {
      setWorkoutLogs(prevLogs => [...prevLogs, newWorkout].sort((a, b) => a.date.localeCompare(b.date)));
    }
  };

  const filteredLogs = useMemo(() => {
    return workoutLogs
      .filter(workout => filterType === '' || workout.type === filterType)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [workoutLogs, filterType]);

  const workoutProgressChart = useMemo(() => {
    return (
      <LineChart width={600} height={300} data={filteredLogs}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <CartesianGrid stroke="#f5f5f5" />
        <Line type="monotone" dataKey="duration" stroke="#ff7300" yAxisId={0} name="Duration" />
        <Legend />
      </LineChart>
    );
  }, [filteredLogs]); 

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
      <div style={{ margin: '20px 0' }}>
        <label>Filter by Type: </label>
        <select onChange={(e) => setFilterType(e.target.value)} value={filterType}>
          <option value="">All</option>
          {/* This could be dynamically generated based on existing types in workoutLogs */}
          <option value="Running">Running</option>
          <option value="Cycling">Cycling</option>
          <option value="Swimming">Swimming</option>
        </select>
      </div>
      <div className="workout-chart">
        {filteredLogs.length > 0 ? workoutProgressChart : <p>No workouts logged yet.</p>}
      </div>
    </div>
  );
};

export default WorkoutTracker;