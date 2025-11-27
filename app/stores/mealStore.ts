import { defineStore } from "pinia";
import { computed, ref } from "vue";
import axios from "axios";
import type {
  NutritionSummary,
  MealPost,
  MealResponse,
} from "~/types/NutritionTypes";
import { useLoginStore } from "~/stores/loginStore";

export const useMealStore = defineStore("meal", () => {
  const summary = ref<NutritionSummary | null>(null);
  const meals = ref<MealResponse[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const lastLoadedAt = ref<string | null>(null);

  const fetchTodaySummary = async (memberId: number) => {
    if (!memberId) {
      error.value = "회원 정보를 확인할 수 없습니다.";
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await axios.get<NutritionSummary>("/meal", {
        params: { id: memberId },
      });

      summary.value = response.data;
      lastLoadedAt.value = new Date().toISOString();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        error.value =
          err.response?.data?.message ??
          err.response?.statusText ??
          "데이터를 불러오지 못했습니다.";
      } else {
        error.value = "알 수 없는 오류가 발생했습니다.";
      }
      summary.value = null;
    } finally {
      loading.value = false;
    }
  };

  const postMeal = async (mealData: MealPost) => {
    const loginStore = useLoginStore();
    const memberId = loginStore.user?.id;

    if (!memberId) {
      error.value = "로그인 정보가 없습니다.";
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const payload = {
        ...mealData,
        memberId: memberId,
      };
      const response = await axios.post<MealResponse>("/meal", payload);
      meals.value.push(response.data);
      // After posting a new meal, you might want to refresh the summary
      await fetchTodaySummary(memberId);
      return response.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        error.value =
          err.response?.data?.message ??
          err.response?.statusText ??
          "식사 기록을 저장하는 데 실패했습니다.";
      } else {
        error.value = "알 수 없는 오류가 발생했습니다.";
      }
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const fetchRecentMeals = async (limit: number = 1) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.get<MealResponse[]>("/meal/recent", {
        params: { limit },
      });
      return response.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        error.value =
          err.response?.data?.message ??
          err.response?.statusText ??
          "최근 식사 정보를 불러오는 데 실패했습니다.";
      } else {
        error.value = "알 수 없는 오류가 발생했습니다.";
      }
      return [];
    } finally {
      loading.value = false;
    }
  };

  const reset = () => {
    summary.value = null;
    meals.value = [];
    error.value = null;
    lastLoadedAt.value = null;
  };

  const calorieBalance = computed(() => {
    if (!summary.value) return null;
    return summary.value.totalCalories - summary.value.burnedCalories;
  });

  return {
    summary,
    meals,
    loading,
    error,
    lastLoadedAt,
    calorieBalance,

    fetchTodaySummary,
    postMeal,
    fetchRecentMeals,
    reset,
  };
});
