<template>
  <v-container>
    <v-form v-model="valid" ref="registerForm">
      <div class="d-flex align-center">
        <v-text-field
          v-if="!props.isPut"
          v-model="form.username"
          label="아이디"
          :rules="[(v) => !!v || '아이디는 필수입니다']"
          required
          :hint="usernameHint"
          :error-messages="usernameError"
        />
      </div>

      <div class="d-flex align-center">
        <v-text-field
          v-model="form.displayName"
          label="닉네임"
          required
          :hint="nameHint"
          :error-messages="nameError"
          class="mr-2"
        />
      </div>

      <v-text-field v-model="form.name" label="이름" required />

      <v-text-field v-model="form.email" label="이메일" type="email" required />

      <v-text-field
        v-model="form.password"
        label="비밀번호"
        type="password"
        :rules="passwordRules"
        :required="!props.isPut"
      />

      <v-text-field
        v-model="passwordConfirm"
        label="비밀번호 확인"
        type="password"
        :rules="passwordConfirmRules"
        :required="!props.isPut"
      />

      <v-select v-model="form.sex" :items="sexItems" label="성별" outlined />

      <v-text-field
        v-model.number="form.age"
        label="나이"
        type="number"
        outlined
        :rules="[(v) => v >= 0 || '나이는 0 이상이어야 합니다']"
      />

      <v-text-field v-model="form.phone" label="전화번호" />

      <v-text-field
        v-model.number="form.height"
        label="키 (cm)"
        type="number"
        :rules="[(v) => v > 0 || '키를 입력해주세요']"
        outlined
      />

      <v-text-field
        v-model.number="form.weight"
        label="몸무게 (kg)"
        type="number"
        :rules="[(v) => v > 0 || '몸무게를 입력해주세요']"
        outlined
      />

      <v-checkbox
        v-model="form.privacyAccepted"
        label="개인정보 수집 및 이용에 동의합니다"
        :rules="agreementRules.privacy"
        :disabled="props.isPut"
      />
      <v-checkbox
        v-model="form.termsAccepted"
        label="이용약관에 동의합니다"
        :rules="agreementRules.terms"
        :disabled="props.isPut"
      />
      <v-checkbox
        v-model="form.marketingAccepted"
        label="마케팅 정보 수신에 동의합니다 (선택)"
      />

      <div>
        <v-btn
          v-if="!props.isPut"
          :disabled="!canSubmit"
          @click="submitForm"
          color="primary"
        >
          회원가입
        </v-btn>
        <v-btn
          v-else
          @click="submitForm"
          color="primary"
          style="margin: 0 auto"
        >
          회원정보수정
        </v-btn>
      </div>
    </v-form>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import type { UserInfoForm } from "../types/UserInfoTypes";
import { useLoginStore } from "../stores/loginStore";
import axios from "axios";

const props = defineProps<{
  //수정시에 들어오는 기존 폼의 데이타
  apiURL: string;
  formData?: Partial<UserInfoForm>;
  isPut?: boolean;
}>();

const defaultForm: UserInfoForm = {
  username: "",
  name: "",
  password: "",
  email: "",
  displayName: "",
  sex: "",
  age: 0,
  phone: "",
  height: 0,
  weight: 0,
  privacyAccepted: false,
  termsAccepted: false,
  marketingAccepted: false,
};

const valid = ref(false);
const passwordConfirm = ref("");
const form = ref<UserInfoForm>({ ...defaultForm });

watch(
  () => props.formData,
  (value) => {
    form.value = {
      ...defaultForm,
      ...(value ?? {}),
      privacyAccepted: props.isPut
        ? value?.privacyAccepted ?? true
        : value?.privacyAccepted ?? false,
      termsAccepted: props.isPut
        ? value?.termsAccepted ?? true
        : value?.termsAccepted ?? false,
      marketingAccepted: value?.marketingAccepted ?? false,
    } as UserInfoForm;
  },
  { immediate: true }
);

const usernameError = ref("");
const nameError = ref("");
const usernameHint = ref("");
const nameHint = ref("");

const passwordRules = computed(() =>
  props.isPut
    ? []
    : [
        (v: string) => !!v || "비밀번호 확인은 필수입니다",
        (v: string) => v.length >= 6 || "비밀번호는 최소 6자 이상이어야 합니다",
        (v: string) => /[0-9]/.test(v) || "숫자를 포함해야 합니다",
        (v: string) => /[!@#$%^&*]/.test(v) || "특수문자를 포함해야 합니다",
      ]
);

const passwordConfirmRules = computed(() => [
  (v: string) => (!!props.isPut ? true : !!v) || "비밀번호 확인은 필수입니다",
  (v: string) =>
    v === form.value.password ||
    (props.isPut ? true : "비밀번호가 일치하지 않습니다"),
]);

const agreementRules = computed(() => ({
  privacy: props.isPut
    ? []
    : [(v: boolean) => v || "개인정보 동의는 필수입니다"],
  terms: props.isPut ? [] : [(v: boolean) => v || "이용약관 동의는 필수입니다"],
}));

const sexItems = ["남자", "여자"];

const canSubmit = computed(() => {
  if (props.isPut) {
    return valid.value;
  }
  return valid.value && form.value.privacyAccepted && form.value.termsAccepted;
});

const router = useRouter();

const loginStore = useLoginStore();

const config = useRuntimeConfig();
const baseURL = config.public.apiBase as string;

const submitForm = async () => {
  if (props.isPut) {
    form.value.username = props.formData?.username as string;
    try {
      console.log("풋요청발동");
      const response = await axios.put(props.apiURL, form.value);
      localStorage.setItem("user", JSON.stringify(response.data));

      loginStore.loadUserFromLocalStorage();
      alert("회원수정이 완료되었습니다!");
    } catch (error: any) {
      console.error("회원수정 실패:", error);

      // 🆕 백엔드 커스텀 에러 정보 표시
      if (error.response?.data?.errorCode) {
        alert(
          `에러: ${error.response.data.errorCode}\n메시지: ${error.response.data.message}`
        );
      } else {
        alert("회원수정에 실패했습니다.");
      }
    }
  } else {
    try {
      const response = await axios.post(
        `${baseURL}` + props.apiURL,
        form.value
      );
      console.log(response.data);
      console.log("회원가입됨" + form.value);

      alert("회원가입이 완료되었습니다!");
      router.push("/");
    } catch (error: any) {
      console.error("회원가입 실패:", error);

      // 🆕 백엔드 커스텀 에러 정보 표시
      if (error.response?.data?.errorCode) {
        alert(
          `에러: ${error.response.data.errorCode}\n메시지: ${error.response.data.message}`
        );
      } else {
        alert("회원가입에 실패했습니다.");
      }
    }
  }
};
</script>
<style scoped>
.preview {
  margin-top: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

v-form > * {
  max-width: 50%;
}
</style>
<script lang="ts">
export default {
  name: "RegisterFormComponent",
};
</script>
