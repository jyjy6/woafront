<template>
  <RecordForm
    title="운동 기록 추가"
    :fields="fields"
    :initial-data="initialData"
    :submit-action="postWorkout"
    success-message="운동 기록이 성공적으로 저장되었습니다."
    redirect-route="/dashboard"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useWorkoutStore } from "~/stores/workoutStore";
import type { WorkoutItem } from "~/types/WorkoutTypes";
import type { FieldConfig } from "~/types/FormTypes";
import RecordForm from "~/components/RecordForm.vue";

const workoutStore = useWorkoutStore();

// Rules can be defined once
const rules = {
  required: (value: any) => !!value || "필수 항목입니다.",
};

// Define the form structure as data
const fields = ref<FieldConfig[]>([
  {
    name: "workoutType",
    label: "운동 종류",
    type: "select",
    items: ["STRENGTH_TRAINING", "CARDIO", "FLEXIBILITY", "SPORTS"],
    rules: [rules.required],
    md: 6,
  },
  {
    name: "exerciseName",
    label: "운동 이름",
    type: "text",
    rules: [rules.required],
    md: 6,
  },
  {
    name: "intensity",
    label: "강도",
    type: "select",
    items: ['LEVEL_0', 'LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4', 'LEVEL_5', 'LEVEL_6', 'LEVEL_7', 'LEVEL_8', 'LEVEL_9', 'LEVEL_10'],
    md: 12,
  },
  { name: "sets", label: "세트", type: "number", min: 0, md: 6 },
  { name: "reps", label: "횟수", type: "number", min: 0, md: 6 },
  {
    name: "weight",
    label: "무게 (kg)",
    type: "number",
    min: 0,
    suffix: "kg",
    md: 6,
  },
  {
    name: "durationMinutes",
    label: "운동 시간 (분)",
    type: "number",
    min: 0,
    suffix: "분",
    md: 6,
  },
  {
    name: "distanceKm",
    label: "거리 (km)",
    type: "number",
    min: 0,
    suffix: "km",
  },
  {
    name: "workoutDate",
    label: "운동 날짜",
    type: "datetime-local",
    rules: [rules.required],
  },
  { name: "notes", label: "메모", type: "textarea", rows: 3 },
]);

// Define the initial state of the form
const initialData = ref<Omit<WorkoutItem, "id" | "memberId">>({
  workoutType: "STRENGTH_TRAINING",
  exerciseName: "",
  intensity: "LEVEL_5",
  sets: null,
  reps: null,
  weight: null,
  durationMinutes: null,
  distanceKm: null,
  workoutDate: new Date().toISOString().slice(0, 16),
  notes: null,
});

// The function to be passed to the form component
const postWorkout = (data: Omit<WorkoutItem, "id" | "memberId">) => {
  return workoutStore.postWorkout(data);
};
</script>
