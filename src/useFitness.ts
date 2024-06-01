import { useEffect, useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';

interface Workout {
  id: number;
  name: string;
  completed: boolean;
  progress: number;
  personalizedRecommendations: string[];
}

interface UseWorkoutServiceResult {
  currentWorkout: Workout | null;
  loadWorkout: () => Promise<void>;
  updateProgress: (id: number, newProgress: number) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const useWorkoutService = (): UseWorkoutServiceResult => {
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const workoutServiceUrl = process.env.REACT_APP_WORKOUT_API_URL;

  const handleServiceError = (serviceError: AxiosError | Error) => {
    if (axios.isAxiosError(serviceError)) {
      const errorMessage = serviceError.response?.data?.message || serviceError.message;
      console.error("Service Error:", errorMessage);
      setError(errorMessage);
    } else {
      console.error("Unexpected Error:", serviceError.message);
      setError('An unexpected error occurred.');
    }
  };

  const loadWorkout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${workoutServiceUrl}/workouts`);
      setCurrentWorkout(response.data);
    } catch (serviceError) {
      handleServiceError(serviceError);
    } finally {
      setIsLoading(false);
    }
  }, [workoutServiceUrl]);

  const updateProgress = useCallback(async (id: number, newProgress: number): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.put(`${workoutServiceUrl}/workouts/${id}`, { progress: newProgress });
      // Directly update state instead of re-fetching
      if (currentWorkout && currentWorkout.id === id) {
        setCurrentWorkout({ ...currentWorkout, progress: newProgress });
      }
    } catch (serviceError) {
      handleServiceError(serviceError);
    } finally {
      setIsLoading(false);
    }
  }, [workoutServiceUrl, currentWorkout]);

  useEffect(() => {
    loadWorkout();
  }, [loadWorkout]);

  return {
    workoutData: currentWorkout,
    fetchWorkoutData: loadWorkout,
    updateWorkoutProgress: updateProgress,
    isLoading,
    errorMessage: error,
  };
};