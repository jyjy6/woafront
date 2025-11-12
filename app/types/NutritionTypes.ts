export interface NutritionSummary {
  totalCalories: number;
  burnedCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  
  recommendedCalories: number;
  recommendedProteinRatio: number;
  recommendedCarbRatio: number;
  recommendedFatRatio: number;
}

export type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

export interface MealPost {
  mealType: MealType;
  foodName: string;
  calories?: number | null;
  protein?: number | null;
  carbohydrates?: number | null;
  fat?: number | null;
  mealDate?: string | null;
  notes?: string | null;
  imageUrl?: string | null;
}

export interface MealResponse extends MealPost {
  id: number;
  memberId: number;
}
