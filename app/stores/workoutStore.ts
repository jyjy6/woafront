import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import type { WorkoutItem } from "~/types/WorkoutTypes";
import { useLoginStore } from "~/stores/loginStore";

export const useWorkoutStore = defineStore("workout", () => {
  const workouts = ref<WorkoutItem[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const lastLoadedAt = ref<string | null>(null);

  const fetchDailyWorkouts = async (date?: string) => {
    if (!date) {
      error.value = "조회할 날짜가 필요합니다.";
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await axios.get<WorkoutItem[]>("/workout", {
        params: { date },
      });
      workouts.value = response.data;
      lastLoadedAt.value = new Date().toISOString();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        error.value =
          err.response?.data?.message ??
          err.response?.statusText ??
          "운동 정보를 불러오는 데 실패했습니다.";
      } else {
        error.value = "알 수 없는 오류가 발생했습니다.";
      }
      workouts.value = [];
    } finally {
      loading.value = false;
    }
  };

  const postWorkout = async (
    workoutData: Omit<WorkoutItem, "id" | "memberId">
  ) => {
    const loginStore = useLoginStore();
    const memberId = loginStore.user?.id;

    if (!memberId) {
      error.value = "로그인 정보가 없습니다.";
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      // The backend expects memberId, so we add it to the payload.
      const payload = {
        ...workoutData,
        memberId: memberId,
      };
      const response = await axios.post<WorkoutItem>("/workout", payload);
      // Optionally, add the new workout to the local state
      workouts.value.push(response.data);
      return response.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        error.value =
          err.response?.data?.message ??
          err.response?.statusText ??
          "운동 기록을 저장하는 데 실패했습니다.";
      } else {
        error.value = "알 수 없는 오류가 발생했습니다.";
      }
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const fetchRecentWorkouts = async (limit: number = 1) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.get<WorkoutItem[]>("/workout/recent", {
        params: { limit },
      });
      return response.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        error.value =
          err.response?.data?.message ??
          err.response?.statusText ??
          "최근 운동 정보를 불러오는 데 실패했습니다.";
      } else {
        error.value = "알 수 없는 오류가 발생했습니다.";
      }
      return [];
    } finally {
      loading.value = false;
    }
  };

  const reset = () => {
    workouts.value = [];
    loading.value = false;
    error.value = null;
    lastLoadedAt.value = null;
  };

  return {
    workouts,
    loading,
    error,
    lastLoadedAt,
    fetchDailyWorkouts,
    postWorkout,
    fetchRecentWorkouts,
    reset,
  };
});
