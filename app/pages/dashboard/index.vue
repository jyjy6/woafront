<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useLoginStore } from "~/stores/loginStore";
import { useMealStore } from "~/stores/mealStore";
import { useWorkoutStore } from "~/stores/workoutStore";

const loginStore = useLoginStore();
const mealStore = useMealStore();
const workoutStore = useWorkoutStore();

const { user, isLogin } = storeToRefs(loginStore);
const { summary, loading, error, lastLoadedAt, calorieBalance } =
  storeToRefs(mealStore);

const {
  workouts,
  loading: workoutLoading,
  error: workoutError,
  lastLoadedAt: workoutLastLoadedAt,
} = storeToRefs(workoutStore);

const numberFormatter = new Intl.NumberFormat("ko-KR", {
  maximumFractionDigits: 1,
});

const calorieFormatter = new Intl.NumberFormat("ko-KR", {
  maximumFractionDigits: 0,
});

const netCalories = computed(() => {
  if (!summary.value) return 0;
  return summary.value.totalCalories - summary.value.burnedCalories;
});

const calorieProgress = computed(() => {
  if (!summary.value || summary.value.recommendedCalories <= 0) return 0;
  const ratio = (netCalories.value / summary.value.recommendedCalories) * 100;
  return Math.min(Math.max(Math.round(ratio), 0), 150);
});

const macroItems = computed(() => {
  if (!summary.value) return [];
  return [
    {
      key: "protein",
      label: "단백질",
      consumed: summary.value.totalProtein,
      recommended: summary.value.recommendedProteinRatio,
      color: "deep-purple-accent-4",
    },
    {
      key: "carbs",
      label: "탄수화물",
      consumed: summary.value.totalCarbs,
      recommended: summary.value.recommendedCarbRatio,
      color: "blue-accent-4",
    },
    {
      key: "fat",
      label: "지방",
      consumed: summary.value.totalFat,
      recommended: summary.value.recommendedFatRatio,
      color: "teal-accent-4",
    },
  ];
});

const formatNumber = (value: number, digits = 1) =>
  new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(value);

const formatDateTime = (isoString: string) => {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("ko-KR", {
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return isoString;
  }
};

const formatWorkoutSetInfo = (sets: number | null, reps: number | null) => {
  if (sets == null && reps == null) return "-";
  const setText = sets != null ? `${sets}세트` : "-세트";
  const repText = reps != null ? `${reps}회` : "-회";
  return `${setText} × ${repText}`;
};

const formatWorkoutWeight = (weight: number | null) => {
  if (weight == null) return "-";
  return `${formatNumber(weight, 1)} kg`;
};

const formatWorkoutDuration = (minutes: number | null) => {
  if (minutes == null) return "-";
  return `${formatNumber(minutes, 0)} 분`;
};

const formatWorkoutDistance = (distance: number | null) => {
  if (distance == null) return "-";
  return `${formatNumber(distance, 1)} km`;
};

const workoutLoadedAtText = computed(() =>
  workoutLastLoadedAt.value ? formatDateTime(workoutLastLoadedAt.value) : null
);

const hasWorkoutData = computed(() => workouts.value.length > 0);

const toDateParam = (date: Date) => date.toISOString().split("T")[0];

const fetchSummary = async () => {
  const memberId = user.value?.id;
  console.log("memberId", memberId);
  if (!memberId) return;
  await mealStore.fetchTodaySummary(memberId);
};

const fetchWorkouts = async (targetDate?: Date) => {
  const memberId = user.value?.id;
  if (!memberId) return;

  const requestDate = targetDate
    ? toDateParam(targetDate)
    : toDateParam(new Date());
  await workoutStore.fetchDailyWorkouts(requestDate);
};

const handleRefresh = async () => {
  if (!loading.value) {
    await fetchSummary();
  }
  if (!workoutLoading.value) {
    await fetchWorkouts();
  }
};

onMounted(() => {
  if (import.meta.client) {
    fetchSummary();
    fetchWorkouts();
  }
});

if (import.meta.client) {
  watch(
    () => user.value?.id,
    (memberId, prev) => {
      if (memberId && memberId !== prev) {
        fetchSummary();
        fetchWorkouts();
      }
    }
  );
}
</script>

<template>
  <v-btn @click="console.log(loginStore.user?.id)">확인</v-btn>

  <v-container class="py-6" max-width="1200">
    <v-row class="mb-6" align="center">
      <v-col cols="12" md="7">
        <h1 class="text-h4 font-weight-bold mb-1">대시보드</h1>
        <p class="text-body-2 text-medium-emphasis">
          오늘의 영양 섭취와 활동량을 한눈에 확인하세요.
        </p>
      </v-col>
      <v-col cols="12" md="5" class="d-flex flex-column align-end gap-2">
        <v-btn
          color="primary"
          variant="flat"
          :disabled="!user?.id"
          :loading="loading"
          @click="handleRefresh"
        >
          새로고침
        </v-btn>
        <span
          v-if="lastLoadedAt"
          class="text-caption text-medium-emphasis text-right"
        >
          {{ formatDateTime(lastLoadedAt) }} 기준
        </span>
      </v-col>
    </v-row>

    <v-alert v-if="!isLogin || !user" type="info" variant="tonal" class="mb-6">
      로그인 후 개인 맞춤 영양 정보를 확인할 수 있습니다.
    </v-alert>

    <v-alert v-else-if="error" type="error" variant="tonal" class="mb-6">
      {{ error }}
    </v-alert>

    <v-alert v-else-if="workoutError" type="error" variant="tonal" class="mb-6">
      {{ workoutError }}
    </v-alert>

    <v-skeleton-loader
      v-if="loading && !summary"
      type="card"
      class="mb-6"
      elevation="2"
    />

    <v-row v-if="summary" dense>
      <v-col cols="12" md="6">
        <v-card elevation="2">
          <v-card-title class="text-h6 font-weight-bold">
            칼로리 현황
          </v-card-title>
          <v-card-subtitle>오늘 목표 대비 섭취량</v-card-subtitle>
          <v-card-text>
            <div class="d-flex justify-space-between align-center mb-2">
              <div>
                <div class="text-caption text-medium-emphasis">섭취</div>
                <div class="text-h6">
                  {{ calorieFormatter.format(summary.totalCalories) }} kcal
                </div>
              </div>
              <div class="text-right">
                <div class="text-caption text-medium-emphasis">소모</div>
                <div class="text-h6">
                  {{ calorieFormatter.format(summary.burnedCalories) }} kcal
                </div>
              </div>
            </div>
            <v-progress-linear
              :model-value="calorieProgress"
              color="primary"
              bg-color="#E63F31"
              height="10"
              rounded
              class="mb-2 custom-progress-bar"
            />
            <div
              class="d-flex justify-space-between text-caption text-medium-emphasis"
            >
              <span
                >순섭취 {{ calorieFormatter.format(netCalories) }} kcal</span
              >
              <span
                >평균 권장
                {{ calorieFormatter.format(summary.recommendedCalories) }}
                kcal</span
              >
            </div>
            <v-alert
              v-if="calorieBalance !== null"
              :type="
                summary.recommendedCalories - netCalories < 0
                  ? 'warning'
                  : 'success'
              "
              variant="tonal"
              class="mt-4"
            >
              평균 권장량 - 순 섭취량은
              {{
                calorieFormatter.format(
                  -Math.abs(summary.recommendedCalories - netCalories)
                )
              }}
              kcal 입니다.
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card elevation="2">
          <v-card-title class="text-h6 font-weight-bold">
            3대 영양소 섭취
          </v-card-title>
          <v-card-subtitle>권장 섭취량과 비교하세요</v-card-subtitle>
          <v-card-text>
            <v-row dense>
              <v-col
                v-for="macro in macroItems"
                :key="macro.key"
                cols="12"
                class="mb-3"
              >
                <div class="d-flex justify-space-between align-center mb-1">
                  <span class="font-weight-medium">{{ macro.label }}</span>
                  <span class="text-caption text-medium-emphasis">
                    권장 {{ formatNumber(macro.recommended) }} g
                  </span>
                </div>
                <v-progress-linear
                  :model-value="
                    macro.recommended > 0
                      ? Math.min(
                          Math.round(
                            (macro.consumed / macro.recommended) * 100
                          ),
                          200
                        )
                      : 0
                  "
                  :color="macro.color"
                  height="8"
                  rounded
                  class="mb-1"
                />
                <div class="text-caption">
                  섭취 {{ formatNumber(macro.consumed) }} g
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title class="text-h6 font-weight-bold">
            다음 단계
          </v-card-title>
          <v-card-text>
            <p class="text-body-2 mb-3">
              운동 기록이나 식단을 추가하면 더욱 정확한 추천을 받을 수 있어요.
            </p>
            <div class="d-flex gap-2 flex-wrap">
              <v-btn color="secondary" variant="outlined">식단 기록 추가</v-btn>
              <v-btn color="secondary" variant="outlined">운동 계획 확인</v-btn>
              <v-btn color="secondary" variant="outlined"
                >추천 레시피 보기</v-btn
              >
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card v-else variant="tonal" class="mt-8 pa-6 text-center">
      <v-icon size="48" color="primary" class="mb-3">mdi-food-apple</v-icon>
      <h2 class="text-h6 font-weight-bold mb-2">오늘 데이터가 아직 없습니다</h2>
      <p class="text-body-2 text-medium-emphasis mb-4">
        식단이나 운동을 기록하면 요약 정보가 표시됩니다.
      </p>
      <v-btn color="primary" variant="tonal" @click="handleRefresh">
        데이터 새로고침
      </v-btn>
    </v-card>

    <v-skeleton-loader
      v-if="workoutLoading && !hasWorkoutData"
      type="list-item"
      class="mt-8"
      elevation="2"
    />

    <v-card v-else-if="hasWorkoutData" elevation="2" class="mt-8">
      <v-card-title
        class="d-flex flex-column flex-sm-row justify-space-between align-start align-sm-center gap-2"
      >
        <div class="text-h6 font-weight-bold">오늘의 운동 기록</div>
        <span
          v-if="workoutLoadedAtText"
          class="text-caption text-medium-emphasis"
        >
          {{ workoutLoadedAtText }} 기준
        </span>
      </v-card-title>
      <v-divider />
      <v-table density="comfortable">
        <thead>
          <tr>
            <th class="text-left">운동명</th>
            <th class="text-left">종류</th>
            <th class="text-left">세트 · 반복</th>
            <th class="text-left">중량</th>
            <th class="text-left">거리</th>
            <th class="text-left">시간</th>
            <th class="text-left">기록 시간</th>
            <th class="text-left">메모</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="workout in workouts" :key="workout.id">
            <td>{{ workout.exerciseName }}</td>
            <td>{{ workout.workoutType }}</td>
            <td>{{ formatWorkoutSetInfo(workout.sets, workout.reps) }}</td>
            <td>{{ formatWorkoutWeight(workout.weight) }}</td>
            <td>{{ formatWorkoutDistance(workout.distanceKm) }}</td>
            <td>{{ formatWorkoutDuration(workout.durationMinutes) }}</td>
            <td>{{ formatDateTime(workout.workoutDate) }}</td>
            <td>{{ workout.notes ?? "-" }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <v-card v-else variant="tonal" class="mt-8 pa-6 text-center">
      <v-icon size="48" color="primary" class="mb-3">mdi-dumbbell</v-icon>
      <h2 class="text-h6 font-weight-bold mb-2">등록된 운동 기록이 없습니다</h2>
      <p class="text-body-2 text-medium-emphasis mb-4">
        운동을 기록하면 여기에서 하루 운동 데이터를 확인할 수 있습니다.
      </p>
      <v-btn color="primary" variant="tonal" @click="handleRefresh">
        데이터 새로고침
      </v-btn>
    </v-card>
  </v-container>
</template>

<style scoped>
.gap-2 {
  gap: 8px;
}
.custom-progress-bar {
  background-color: #e63f31;
}
</style>
