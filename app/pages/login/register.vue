<template>
  <v-container class="py-8">
    <h1 class="text-h4 font-weight-bold mb-4">회원가입</h1>
    <RegisterForm :form-data="emptyFields" :apiURL="'/member/register'" />
  </v-container>
</template>

<script setup lang="ts">
import { ref } from "vue";

import type { UserInfoForm } from "~/types/UserInfoTypes";

const emptyFields = ref<Partial<UserInfoForm>>({
  username: "",
  password: "",
  email: "",
  displayName: "",
  name: "",
  phone: "",
  sex: "",
  age: 0,
  height: 0,
  weight: 0,
  privacyAccepted: false,
  termsAccepted: false,
  marketingAccepted: false,
});
</script>
