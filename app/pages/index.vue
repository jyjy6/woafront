<script setup lang="ts">
import { ref } from 'vue'

// 알림 스낵바의 열림/닫힘 상태 및 메시지
const snackbar = ref(false)
const snackbarText = ref('')

function showSnackbar(message: string) {
  snackbarText.value = message
  snackbar.value = true
}
</script>

<template>
  <v-container>
    <v-card class="mt-4 pa-4 rounded-lg shadow-lg">
      <v-card-title class="text-h5">
        Vuetify 컴포넌트 사용 예시
      </v-card-title>
      <v-card-text>
        <p class="mb-4">
          이 페이지는 Vuetify의 다양한 컴포넌트들을 사용하여 구성되었습니다.
          {{ `<v-app-bar>` }}, {{ `<v-navigation-drawer>` }}, {{ `<v-card>` }}, {{ `<v-btn>` }} 등
          미리 스타일링된 컴포넌트들을 쉽게 사용할 수 있습니다.
        </p>

        <v-text-field
          label="이름을 입력하세요"
          variant="outlined"
          density="compact"
          class="mt-4"
        ></v-text-field>

        <div class="d-flex ga-2 mt-4">
          <v-btn color="primary" @click="showSnackbar('기본 버튼 클릭됨!')">
            기본 버튼
          </v-btn>
          <v-btn color="secondary" variant="outlined" @click="showSnackbar('아웃라인 버튼 클릭됨!')">
            아웃라인 버튼
          </v-btn>
          <v-btn color="success" flat @click="showSnackbar('플랫 버튼 클릭됨!')">
            <v-icon start>mdi-check-circle</v-icon>
            확인
          </v-btn>
        </div>
        
        <v-dialog width="500">
          <template v-slot:activator="{ props }">
            <v-btn color="orange-darken-2" class="mt-4" v-bind="props">
              <v-icon start>mdi-open-in-new</v-icon>
              다이얼로그 열기
            </v-btn>
          </template>

          <v-card>
            <v-card-title>다이얼로그 제목</v-card-title>
            <v-card-text>
              이것은 Vuetify의 다이얼로그 컴포넌트입니다.
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="showSnackbar('다이얼로그 닫힘')">닫기</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card-text>
    </v-card>

    <v-card class="mt-6 pa-4 rounded-lg shadow-lg">
      <v-card-title>그리드 시스템 (반응형)</v-card-title>
      <v-card-text>
        <p>
          {{ `<v-row>` }}과 {{ `<v-col>` }}을 사용하여 반응형 레이아웃을 구성할 수 있습니다.
          (브라우저 크기를 조절해보세요)
        </p>
        <v-row class="mt-4">
          <v-col cols="12" sm="6" md="4">
            <v-card flat class="pa-2 text-center bg-indigo-lighten-5">
              <v-card-text>col-12 sm-6 md-4</v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-card flat class="pa-2 text-center bg-cyan-lighten-5">
              <v-card-text>col-12 sm-6 md-4</v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-card flat class="pa-2 text-center bg-teal-lighten-5">
              <v-card-text>col-12 sm-6 md-4</v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>

  <v-snackbar
    v-model="snackbar"
    :timeout="3000"
  >
    {{ snackbarText }}
    <template v-slot:actions>
      <v-btn
        color="blue"
        variant="text"
        @click="snackbar = false"
      >
        닫기
      </v-btn>
    </template>
  </v-snackbar>
</template>

<style scoped>
/* Vuetify는 대부분의 스타일을 컴포넌트와 prop으로 처리하므로 
   이 <style scoped> 섹션은 보통 비어있거나 아주 적은 내용만 가집니다. 
   필요하다면 여기에 커스텀 CSS를 추가할 수 있습니다. */
</style>