import { defineStore } from "pinia";
import { computed, ref } from "vue";
import axios from "axios";
import type { NutritionSummary } from "~/types/NutritionTypes";

export const useMealStore = defineStore("meal", () => {
  const summary = ref<NutritionSummary | null>(null);
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

  const reset = () => {
    summary.value = null;
    error.value = null;
    lastLoadedAt.value = null;
  };

  const calorieBalance = computed(() => {
    if (!summary.value) return null;
    return summary.value.totalCalories - summary.value.burnedCalories;
  });

  return {
    summary,
    loading,
    error,
    lastLoadedAt,
    calorieBalance,

    fetchTodaySummary,
    reset,
  };
});
