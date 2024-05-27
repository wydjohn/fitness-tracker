import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

interface WorkoutData {
  id: number;
  name: string;
  completed: boolean;
  progress: number;
  personalizedRecommendations: string[];
}

interface UseWorkoutHookResponse {
  workoutData: WorkoutData | null;
  fetchWorkoutData: () => Promise<void>;
  updateWorkoutProgress: (workoutId: number, progress: number) => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
}

export const useWorkoutService = (): UseWorkoutHookResponse => {
  const [workoutData, setWorkoutData] = useState<WorkoutData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const workoutApiUrl = process.env.REACT_APP_WORKOUT_API_URL;

  const fetchWorkoutData = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await axios.get(`${workoutApiUrl}/workouts`);
      setWorkoutData(response.data);
    } catch (error: any) {
      setErrorMessage(error.message || 'An error occurred while fetching workout data.');
    } finally {
      setIsLoading(false);
    }
  }, [workoutApiUrl]);

  const updateWorkoutProgress = useCallback(async (workoutId: number, progress: number): Promise<void> => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await axios.put(`${workoutApiUrl}/workouts/${workoutId}`, { progress });
      await fetchWorkoutData();
    } catch (error: any) {
      setErrorMessage(error.message || 'An error occurred while updating workout progress.');
    } finally {
      setIsLoading(false);
    }
  }, [workoutApiUrl, fetchWorkoutData]);

  useEffect(() => {
    fetchWorkoutData();
  }, [fetchWorkoutData]);

  return {
    workoutData,
    fetchWorkoutData,
    updateWorkoutProgress,
    isLoading,
    errorMessage,
  };
};