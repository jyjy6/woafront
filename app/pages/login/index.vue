<template>
  <v-container class="py-5">
    <v-card elevation="2" class="pa-5 mx-auto" max-width="500">
      <v-card-title>Login</v-card-title>
      <v-card-subtitle>Sign in to your account</v-card-subtitle>
      <v-form @submit.prevent="handleLogin">
        <v-text-field
          label="아이디"
          v-model="username"
          type="text"
          required
          outlined
        />
        <v-text-field
          label="비밀번호"
          v-model="password"
          type="password"
          required
          outlined
        />
        <v-btn type="submit" block color="primary" class="mt-4">Login</v-btn>
      </v-form>
      <v-divider class="my-4" />

      <!-- <v-btn @click="handleGoogleLogin" class="google-login-btn mb-3">
        Google로 로그인
      </v-btn>

      <v-btn @click="handleKakaoLogin" class="kakao-login-btn mb-3">
        카카오로 로그인
      </v-btn> -->
      <v-btn
        @click="loginStore.handleGuestLogin"
        class="mb-3 w-100"
        color="warning"
      >
        게스트 로그인
      </v-btn>

      <v-btn block color="secondary" variant="text" @click="navigateToRegister">
        계정이 없으신가요? 회원가입
      </v-btn>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const username = ref("");
const password = ref("");
const router = useRouter();
const loginStore = useLoginStore();

const handleLogin = async () => {
  const success = await loginStore.login(username.value, password.value);
  if (success) {
    username.value = "";
    password.value = "";
  }
};

const navigateToRegister = () => {
  router.push("/login/register");
};

// // 구글 로그인 버튼 클릭 시 실행되는 함수
// async function handleGoogleLogin() {
//   window.location.href = `${
//     import.meta.env.VITE_API_AUTH_URL
//   }/oauth2/authorization/google`;
// }

// // 카카오 로그인 버튼 클릭 시 실행되는 함수
// async function handleKakaoLogin() {
//   window.location.href = `${
//     import.meta.env.VITE_API_AUTH_URL
//   }/oauth2/authorization/kakao`;
// }
</script>

<style scoped>
.google-login-btn {
  background-color: #db4437;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  width: 100%;
}

.kakao-login-btn {
  background-color: #fee500;
  color: #000000;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  width: 100%;
}

.v-card {
  text-align: center;
}

.google-login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: white;
  border: 1px solid #dadce0;
  border-radius: 4px;
  font-family: "Roboto", sans-serif;
  font-weight: 500;
  color: #3c4043;
  cursor: pointer;
  transition: background-color 0.3s;
}

.google-login-btn:hover {
  background-color: #f1f3f4;
}

.kakao-login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: #fee500;
  border: 1px solid #fee500;
  border-radius: 4px;
  font-family: "Roboto", sans-serif;
  font-weight: 500;
  color: #000000;
  cursor: pointer;
  transition: background-color 0.3s;
}

.kakao-login-btn:hover {
  background-color: #fdd835;
}

.google-icon {
  width: 18px;
  height: 18px;
}
</style>
