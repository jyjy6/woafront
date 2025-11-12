<template>
  <RecordForm
    title="식사 기록 추가"
    :fields="fields"
    :initial-data="initialData"
    :submit-action="postMeal"
    success-message="식사 기록이 성공적으로 저장되었습니다."
    redirect-route="/dashboard"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useMealStore } from "~/stores/mealStore";
import type { MealPost, MealType } from "~/types/NutritionTypes";
import type { FieldConfig } from "~/types/FormTypes";
import RecordForm from "~/components/RecordForm.vue";

const mealStore = useMealStore();

const rules = {
  required: (value: any) => !!value || "필수 항목입니다.",
};

const mealTypes: MealType[] = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];

const fields = ref<FieldConfig[]>([
  {
    name: "mealType",
    label: "식사 종류",
    type: "select",
    items: mealTypes,
    rules: [rules.required],
    md: 6,
  },
  {
    name: "foodName",
    label: "음식 이름",
    type: "text",
    rules: [rules.required],
    md: 6,
  },
  {
    name: "calories",
    label: "칼로리",
    type: "number",
    min: 0,
    suffix: "kcal",
    md: 3,
    cols: 6,
  },
  {
    name: "protein",
    label: "단백질",
    type: "number",
    min: 0,
    suffix: "g",
    md: 3,
    cols: 6,
  },
  {
    name: "carbohydrates",
    label: "탄수화물",
    type: "number",
    min: 0,
    suffix: "g",
    md: 3,
    cols: 6,
  },
  {
    name: "fat",
    label: "지방",
    type: "number",
    min: 0,
    suffix: "g",
    md: 3,
    cols: 6,
  },
  { name: "mealDate", label: "식사 시간", type: "datetime-local" },
  { name: "imageUrl", label: "음식 사진 URL", type: "text" },
  { name: "notes", label: "메모", type: "textarea", rows: 3 },
]);

const initialData = ref<MealPost>({
  mealType: "LUNCH",
  foodName: "",
  calories: null,
  protein: null,
  carbohydrates: null,
  fat: null,
  mealDate: new Date().toISOString().slice(0, 16),
  notes: "",
  imageUrl: "",
});

const postMeal = (data: MealPost) => {
  return mealStore.postMeal(data);
};
</script>
