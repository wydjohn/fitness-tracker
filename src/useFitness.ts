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
  workoutData: Workout | null;
  fetchWorkoutData: () => Promise<void>;
  updateWorkoutProgress: (id: number, newProgress: number) => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
}

export const useWorkoutService = (): UseWorkworkoutdataServiceResult => {
  const [workoutData, setWorkoutData] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const workoutServiceUrl = process.env.REACT_APP_WORKOUT_API_URL;

  // Streamlined error handler
  const handleServiceError = (error: unknown) => {
    let message = 'An unexpected error occurred.';
    if (axios.isAxiosError(error) && error.response) {
      message = error.response.data?.message || error.message;
    } else if (error instanceof Error) {
      message = error.message;
    }
    console.error("Service Error:", message);
    setErrorMessage(message);
  };

  const loadWorkout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await axios.get(`${workoutServiceUrl}/workouts`);
      setWorkoutData(response.data);
    } catch (error) {
      handleServiceError(error);
    } finally {
      setIsLoading(false);
    }
  }, [workoutServiceUrl]);

  const updateWorkoutProgress = useCallback(async (id: number, newProgress: number): Promise<void> => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await axios.put(`${workoutServiceUrl}/workouts/${id}`, { progress: newProgress });
      if (workoutData && workoutData.id === id) {
        setWorkoutData({ ...workoutData, progress: newProgress });
      }
    } catch (error) {
      handleServiceError(error);
    } finally {
      setIsLoading(false);
    }
  }, [workoutServiceUrl, workoutData]);

  useEffect(() => {
    loadWorkout();
  }, [loadWorkout]);

  return {
    workoutData,
    fetchWorkoutData: loadWorkout,
    updateWorkoutProgress,
    isLoading,
    errorMessage,
  };
};