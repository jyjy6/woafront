<template>
  <v-container>
    <v-card class="mx-auto" max-width="600">
      <v-card-title class="text-h5">
        {{ title }}
      </v-card-title>
      <v-card-text>
        <v-form
          ref="form"
          v-model="valid"
          lazy-validation
          @submit.prevent="submit"
        >
          <v-row>
            <template v-for="field in fields" :key="field.name">
              <v-col :cols="field.cols || 12" :md="field.md">
                <v-select
                  v-if="field.type === 'select'"
                  v-model="formData[field.name]"
                  :label="field.label"
                  :items="field.items"
                  :rules="field.rules"
                ></v-select>
                <v-textarea
                  v-else-if="field.type === 'textarea'"
                  v-model="formData[field.name]"
                  :label="field.label"
                  :rules="field.rules"
                  :rows="field.rows"
                  class="mb-4"
                ></v-textarea>

                <v-text-field
                  v-else
                  v-model="formData[field.name]"
                  :label="field.label"
                  :type="field.type"
                  :rules="field.rules"
                  :suffix="field.suffix"
                  :min="field.min"
                ></v-text-field>
              </v-col>
            </template>
          </v-row>

          <v-alert v-if="error" type="error" dense class="mt-3 mb-4">
            {{ error }}
          </v-alert>

          <v-btn
            :loading="loading"
            :disabled="!valid || loading"
            color="primary"
            type="submit"
            block
            class="mt-4"
          >
            기록 저장
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import type { FieldConfig } from "~/types/FormTypes";

const props = defineProps<{
  title: string;
  fields: FieldConfig[];
  initialData: Record<string, any>;
  submitAction: (data: any) => Promise<any>;
  successMessage: string;
  redirectRoute: string;
}>();

const router = useRouter();
const form = ref<HTMLFormElement | null>(null);
const valid = ref(true);
const loading = ref(false);
const error = ref<string | null>(null);

const formData = ref<Record<string, any>>({});

// Initialize formData with a deep copy of initialData
watch(
  () => props.initialData,
  (newData) => {
    formData.value = JSON.parse(JSON.stringify(newData));
  },
  { immediate: true, deep: true }
);

const submit = async () => {
  if (form.value?.validate) {
    const { valid: isValid } = await form.value.validate();
    if (!isValid) return;
  }

  loading.value = true;
  error.value = null;

  try {
    // Convert number fields from string back to number if needed
    props.fields.forEach((field) => {
      if (field.type === "number" && formData.value[field.name]) {
        formData.value[field.name] = parseFloat(formData.value[field.name]);
      }
    });

    await props.submitAction(formData.value);
    alert(props.successMessage);
    await router.push(props.redirectRoute);
  } catch (e: any) {
    error.value = e.message || "저장에 실패했습니다. 다시 시도해주세요.";
    console.error(e);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.v-card {
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
