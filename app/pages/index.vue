<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useWorkoutStore } from "~/stores/workoutStore";
import { useMealStore } from "~/stores/mealStore";
import type { WorkoutItem } from "~/types/WorkoutTypes";
import type { MealResponse } from "~/types/NutritionTypes";

// 현재 시간에 따른 인사말
const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return "좋은 아침이에요";
  if (hour < 18) return "좋은 오후에요";
  return "좋은 저녁이에요";
});

// Stores
const workoutStore = useWorkoutStore();
const mealStore = useMealStore();

// 최근 활동 데이터
const recentWorkout = ref<WorkoutItem | null>(null);
const recentMeal = ref<MealResponse | null>(null);
const loadingActivities = ref(false);

// 날짜/시간 포맷팅 함수
const formatDateTime = (isoString: string) => {
  try {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const period = hour < 12 ? "오전" : "오후";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${year}년 ${month}월 ${day}일 ${period} ${displayHour}:${minute
      .toString()
      .padStart(2, "0")}`;
  } catch {
    return "";
  }
};

// 운동 정보 포맷팅
const formatWorkoutInfo = (workout: WorkoutItem) => {
  const parts: string[] = [];

  if (workout.durationMinutes) {
    parts.push(`${workout.durationMinutes}분`);
  }

  if (workout.distanceKm) {
    parts.push(`${workout.distanceKm}km`);
  }

  if (workout.sets) {
    parts.push(`${workout.sets}세트`);
  }

  if (workout.reps) {
    parts.push(`${workout.reps}회`);
  }

  if (workout.weight) {
    parts.push(`${workout.weight}kg`);
  }

  const info = parts.length > 0 ? parts.join(" · ") : "기록 없음";
  const time = workout.workoutDate ? formatDateTime(workout.workoutDate) : "";

  return time ? `${info} · ${time}` : info;
};

// 식사 정보 포맷팅
const formatMealInfo = (meal: MealResponse) => {
  const parts: string[] = [];

  if (meal.foodName) {
    parts.push(meal.foodName);
  }

  if (meal.calories) {
    parts.push(`${Math.round(meal.calories)}kcal`);
  }

  const info = parts.length > 0 ? parts.join(" · ") : "기록 없음";
  const time = meal.mealDate ? formatDateTime(meal.mealDate) : "";

  return time ? `${info} · ${time}` : info;
};

// 식사 타입 한글 변환
const getMealTypeLabel = (mealType: string) => {
  const labels: Record<string, string> = {
    BREAKFAST: "아침",
    LUNCH: "점심",
    DINNER: "저녁",
    SNACK: "간식",
  };
  return labels[mealType] || mealType;
};

// 운동 타입에 따른 아이콘
const getWorkoutIcon = (workoutType: string) => {
  const icons: Record<string, string> = {
    CARDIO: "mdi-run",
    STRENGTH_TRAINING: "mdi-weight-lifter",
    FLEXIBILITY: "mdi-yoga",
    SPORTS: "mdi-basketball",
  };
  return icons[workoutType] || "mdi-dumbbell";
};

// 최근 활동 데이터 로드
const loadRecentActivities = async () => {
  if (import.meta.client) {
    loadingActivities.value = true;
    try {
      const [workouts, meals] = await Promise.all([
        workoutStore.fetchRecentWorkouts(1),
        mealStore.fetchRecentMeals(1),
      ]);

      const firstWorkout =
        workouts && workouts.length > 0 ? workouts[0] : undefined;
      const firstMeal = meals && meals.length > 0 ? meals[0] : undefined;

      recentWorkout.value = firstWorkout ?? null;
      recentMeal.value = firstMeal ?? null;
    } catch (err) {
      console.error("최근 활동 로드 실패:", err);
    } finally {
      loadingActivities.value = false;
    }
  }
};

onMounted(() => {
  loadRecentActivities();
});
</script>

<template>
  <div class="main-page">
    <!-- 히어로 섹션 -->
    <section class="hero-section">
      <v-container class="py-16">
        <v-row align="center" justify="center">
          <v-col cols="12" md="8" class="text-center">
            <div class="hero-content">
              <h1
                class="text-h2 text-md-h1 font-weight-bold mb-4 gradient-text"
              >
                {{ greeting }}, 함께 운동해요
              </h1>
              <p class="text-h6 text-md-h5 text-grey-lighten-1 mb-8">
                운동과 식사를 기록하고<br />
                AI가 분석해주는 건강 관리 앱
              </p>
              <div class="d-flex justify-center ga-4">
                <v-btn
                  size="large"
                  color="primary"
                  variant="elevated"
                  elevation="4"
                  class="px-8"
                  rounded="xl"
                >
                  <v-icon start>mdi-dumbbell</v-icon>
                  운동 기록하기
                </v-btn>
                <v-btn
                  size="large"
                  color="secondary"
                  variant="outlined"
                  class="px-8"
                  rounded="xl"
                >
                  <v-icon start>mdi-food</v-icon>
                  식사 기록하기
                </v-btn>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- 오늘의 요약 통계 -->
    <v-container class="mb-8">
      <v-row class="stats-row">
        <v-col cols="6" md="3">
          <v-card
            class="stat-card stat-card-primary"
            elevation="4"
            rounded="xl"
          >
            <v-card-text class="text-center pa-6">
              <v-icon size="48" class="mb-3">mdi-fire</v-icon>
              <div class="text-h4 font-weight-bold mb-1">1,240</div>
              <div class="text-body-2 text-grey">칼로리 (kcal)</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6" md="3">
          <v-card
            class="stat-card stat-card-secondary"
            elevation="4"
            rounded="xl"
          >
            <v-card-text class="text-center pa-6">
              <v-icon size="48" class="mb-3">mdi-clock-outline</v-icon>
              <div class="text-h4 font-weight-bold mb-1">45</div>
              <div class="text-body-2 text-grey">운동 시간 (분)</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6" md="3">
          <v-card
            class="stat-card stat-card-success"
            elevation="4"
            rounded="xl"
          >
            <v-card-text class="text-center pa-6">
              <v-icon size="48" class="mb-3">mdi-food-apple</v-icon>
              <div class="text-h4 font-weight-bold mb-1">3</div>
              <div class="text-body-2 text-grey">식사 기록</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6" md="3">
          <v-card class="stat-card stat-card-info" elevation="4" rounded="xl">
            <v-card-text class="text-center pa-6">
              <v-icon size="48" class="mb-3">mdi-target</v-icon>
              <div class="text-h4 font-weight-bold mb-1">72%</div>
              <div class="text-body-2 text-grey">목표 달성률</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- 주요 기능 섹션 -->
    <v-container class="mb-8">
      <div class="text-center mb-8">
        <h2 class="text-h4 text-md-h3 font-weight-bold mb-2">주요 기능</h2>
        <p class="text-body-1 text-grey">
          운동과 식사를 쉽게 기록하고 분석해보세요
        </p>
      </div>

      <v-row>
        <v-col cols="12" md="4">
          <v-card
            class="feature-card feature-card-workout"
            elevation="8"
            rounded="xl"
            height="100%"
          >
            <div class="feature-icon-wrapper workout-icon">
              <v-icon size="64">mdi-dumbbell</v-icon>
            </div>
            <v-card-title class="text-h5 font-weight-bold mb-2">
              운동 기록
            </v-card-title>
            <v-card-text>
              <p class="text-body-1 text-grey-darken-1 mb-4">
                다양한 운동을 기록하고<br />
                시간, 강도, 세트 등을<br />
                상세하게 관리하세요
              </p>
              <v-btn color="primary" variant="flat" rounded="lg" block>
                운동 기록하기
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card
            class="feature-card feature-card-meal"
            elevation="8"
            rounded="xl"
            height="100%"
          >
            <div class="feature-icon-wrapper meal-icon">
              <v-icon size="64">mdi-food</v-icon>
            </div>
            <v-card-title class="text-h5 font-weight-bold mb-2">
              식사 기록
            </v-card-title>
            <v-card-text>
              <p class="text-body-1 text-grey-darken-1 mb-4">
                아침, 점심, 저녁, 간식까지<br />
                모든 식사를 기록하고<br />
                영양 정보를 확인하세요
              </p>
              <v-btn color="secondary" variant="flat" rounded="lg" block>
                식사 기록하기
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card
            class="feature-card feature-card-ai"
            elevation="8"
            rounded="xl"
            height="100%"
          >
            <div class="feature-icon-wrapper ai-icon">
              <v-icon size="64">mdi-brain</v-icon>
            </div>
            <v-card-title class="text-h5 font-weight-bold mb-2">
              AI 분석
            </v-card-title>
            <v-card-text>
              <p class="text-body-1 text-grey-darken-1 mb-4">
                AI가 당신의 운동과 식사 패턴을<br />
                분석하고 맞춤형<br />
                건강 팁을 제공합니다
              </p>
              <v-btn color="success" variant="flat" rounded="lg" block>
                AI 분석 보기
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- AI 인사이트 섹션 -->
    <v-container class="mb-8">
      <v-card class="insight-card" elevation="6" rounded="xl" color="primary">
        <v-card-text class="pa-8">
          <v-row align="center">
            <v-col cols="12" md="2" class="text-center">
              <v-avatar size="80" color="white">
                <v-icon size="48" color="primary">mdi-sparkles</v-icon>
              </v-avatar>
            </v-col>
            <v-col cols="12" md="10">
              <h3 class="text-h5 text-md-h4 font-weight-bold text-white mb-2">
                오늘의 AI 인사이트
              </h3>
              <p class="text-body-1 text-white text-opacity-90">
                어제보다 15% 더 많은 칼로리를 소모하셨네요! 운동 강도를 잘
                유지하고 계시는 것 같습니다. 단백질 섭취를 조금 더 늘리면 근육
                회복에 도움이 될 것 같아요.
              </p>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-container>

    <!-- 최근 활동 섹션 -->

    <v-container class="mb-8">
      <h2 class="text-h4 text-md-h3 font-weight-bold mb-6">최근 활동</h2>
      <v-row>
        <v-col cols="12" md="6">
          <v-card class="activity-card" elevation="4" rounded="xl">
            <v-card-title class="d-flex align-center mb-2">
              <v-icon color="primary" class="mr-2">mdi-dumbbell</v-icon>
              <span>최근 운동</span>
            </v-card-title>
            <v-card-text>
              <v-list lines="two" class="pa-0">
                <template v-if="loadingActivities">
                  <v-list-item>
                    <v-list-item-title>로딩 중...</v-list-item-title>
                  </v-list-item>
                </template>
                <template v-else-if="recentWorkout">
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-avatar color="primary" size="40">
                        <v-icon color="white">{{
                          getWorkoutIcon(recentWorkout.workoutType)
                        }}</v-icon>
                      </v-avatar>
                    </template>
                    <v-list-item-title>{{
                      recentWorkout.exerciseName || "운동"
                    }}</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ formatWorkoutInfo(recentWorkout) }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </template>
                <template v-else>
                  <v-list-item>
                    <v-list-item-title class="text-grey"
                      >최근 운동 기록이 없습니다</v-list-item-title
                    >
                    <v-list-item-subtitle
                      >운동을 기록해보세요!</v-list-item-subtitle
                    >
                  </v-list-item>
                </template>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="activity-card" elevation="4" rounded="xl">
            <v-card-title class="d-flex align-center mb-2">
              <v-icon color="secondary" class="mr-2">mdi-food</v-icon>
              <span>최근 식사</span>
            </v-card-title>
            <v-card-text>
              <v-list lines="two" class="pa-0">
                <template v-if="loadingActivities">
                  <v-list-item>
                    <v-list-item-title>로딩 중...</v-list-item-title>
                  </v-list-item>
                </template>
                <template v-else-if="recentMeal">
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-avatar
                        :color="
                          recentMeal.mealType === 'SNACK'
                            ? 'warning'
                            : 'success'
                        "
                        size="40"
                      >
                        <v-icon color="white">
                          {{
                            recentMeal.mealType === "SNACK"
                              ? "mdi-coffee"
                              : "mdi-food-variant"
                          }}
                        </v-icon>
                      </v-avatar>
                    </template>
                    <v-list-item-title>{{
                      getMealTypeLabel(recentMeal.mealType)
                    }}</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ formatMealInfo(recentMeal) }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </template>
                <template v-else>
                  <v-list-item>
                    <v-list-item-title class="text-grey"
                      >최근 식사 기록이 없습니다</v-list-item-title
                    >
                    <v-list-item-subtitle
                      >식사를 기록해보세요!</v-list-item-subtitle
                    >
                  </v-list-item>
                </template>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.main-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%);
}

/* 히어로 섹션 */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.3;
}

.hero-content {
  position: relative;
  z-index: 1;
}

.gradient-text {
  background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 통계 카드 */
.stats-row {
  margin-top: -60px;
  position: relative;
  z-index: 2;
}

.stat-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15) !important;
}

.stat-card-primary {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: white;
}

.stat-card-secondary {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  color: white;
}

.stat-card-success {
  background: linear-gradient(135deg, #95e1d3 0%, #fce38a 100%);
  color: #2d3436;
}

.stat-card-info {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  color: #2d3436;
}

.stat-card .v-icon {
  opacity: 0.9;
}

/* 기능 카드 */
.feature-card {
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.2) !important;
}

.feature-icon-wrapper {
  width: 120px;
  height: 120px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  position: relative;
}

.workout-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.meal-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.ai-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

/* 인사이트 카드 */
.insight-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.insight-card::before {
  content: "";
  position: absolute;
  top: -50%;
  right: -10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 70%
  );
  border-radius: 50%;
}

/* 활동 카드 */
.activity-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.activity-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
}

/* 반응형 디자인 */
@media (max-width: 960px) {
  .stats-row {
    margin-top: -40px;
  }

  .hero-section {
    padding: 60px 0;
  }
}
</style>
