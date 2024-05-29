import { useEffect, useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';

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

  const handleError = (error: AxiosError | Error) => {
    if (axios.isAxiosError(error)) {
      // The error is an AxiosError, indicating an error response from the server or a network error.
      const message = error.response?.data?.message || error.message;
      console.error("Axios error:", message); // Example of more detailed logging.
      setErrorMessage(message);
    } else {
      // The error is some other type of JavaScript error, not related to Axios or the network request.
      console.error("Unexpected error:", error.message);
      setErrorMessage('An unexpected error occurred.');
    }
  };

  const fetchWorkoutData = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await axios.get(`${workoutApiUrl}/workouts`);
      setWorkoutData(response.data);
    } catch (error) {
      handleError(error);
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
    } catch (error) {
      handleError(error);
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