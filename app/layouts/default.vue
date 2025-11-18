<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useLoginStore } from "~/stores/loginStore";

const router = useRouter();
const loginStore = useLoginStore();

// Vuetify drawer(사이드바)의 열림/닫힘 상태를 제어하는 반응형 변수
const drawer = ref(false);

// 로그인 상태 확인
const isAuthenticated = computed(
  () => loginStore.isLogin && loginStore.user !== null
);
const user = computed(() => loginStore.user);

// 로그인/로그아웃 핸들러
const handleLogin = () => {
  router.push("/login");
};

const handleLogout = async () => {
  await loginStore.logout();
};
</script>

<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-app-bar-title class="app-bar-title" @click="router.push('/')">
        WorkOut with Agent
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <!-- 로그인 상태에 따른 UI -->
      <template v-if="isAuthenticated && user">
        <v-menu location="bottom end">
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" variant="text" class="text-white">
              <v-icon start>mdi-account-circle</v-icon>
              {{ user.displayName || user.username }}
            </v-btn>
          </template>
          <v-list>
            <v-list-item>
              <v-list-item-title class="text-body-2">
                {{ user.email }}
              </v-list-item-title>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item @click="router.push('/dashboard')">
              <v-list-item-title>대시보드</v-list-item-title>
              <template v-slot:prepend>
                <v-icon>mdi-view-dashboard</v-icon>
              </template>
            </v-list-item>
            <v-list-item @click="router.push('/admin')">
              <v-list-item-title>운영자 페이지</v-list-item-title>
              <template v-slot:prepend>
                <v-icon>mdi-shield-crown</v-icon>
              </template>
            </v-list-item>
            <v-list-item @click="handleLogout">
              <v-list-item-title>로그아웃</v-list-item-title>
              <template v-slot:prepend>
                <v-icon>mdi-logout</v-icon>
              </template>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>

      <template v-else>
        <v-btn variant="text" class="text-white" @click="handleLogin">
          <v-icon start>mdi-login</v-icon>
          로그인
        </v-btn>
      </template>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app>
      <v-list-item
        v-if="isAuthenticated && user"
        :title="user.displayName || user.username"
        :subtitle="user.email"
      >
        <template v-slot:prepend>
          <v-avatar color="primary">
            <v-icon color="white">mdi-account</v-icon>
          </v-avatar>
        </template>
      </v-list-item>
      <v-list-item v-else title="게스트" subtitle="로그인해주세요">
        <template v-slot:prepend>
          <v-avatar color="grey">
            <v-icon color="white">mdi-account</v-icon>
          </v-avatar>
        </template>
      </v-list-item>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item
          prepend-icon="mdi-home"
          title="홈"
          value="home"
          @click="router.push('/')"
        ></v-list-item>
        <v-list-item
          v-if="isAuthenticated"
          prepend-icon="mdi-view-dashboard"
          title="대시보드"
          value="dashboard"
          @click="router.push('/dashboard')"
        ></v-list-item>
        <v-list-item
          v-if="isAuthenticated"
          prepend-icon="mdi-shield-crown"
          title="운영자 페이지"
          value="admin"
          @click="router.push('/admin')"
        ></v-list-item>
        <v-list-item
          v-if="isAuthenticated"
          prepend-icon="mdi-food-apple"
          title="식단 기록"
          value="meal"
          @click="router.push('/meal/post')"
        ></v-list-item>
        <v-list-item
          v-if="isAuthenticated"
          prepend-icon="mdi-dumbbell"
          title="운동 기록"
          value="workout"
          @click="router.push('/workout/post')"
        ></v-list-item>
        <v-list-item
          v-if="isAuthenticated && user?.roleSet?.includes('ADMIN')"
          prepend-icon="mdi-shield-crown"
          title="관리자"
          value="admin"
          @click="router.push('/admin')"
        ></v-list-item>
      </v-list>

      <template v-slot:append>
        <v-divider></v-divider>
        <v-list density="compact" nav>
          <v-list-item
            v-if="!isAuthenticated"
            prepend-icon="mdi-login"
            title="로그인"
            value="login"
            @click="handleLogin"
          ></v-list-item>
          <v-list-item
            v-else
            prepend-icon="mdi-logout"
            title="로그아웃"
            value="logout"
            @click="handleLogout"
          ></v-list-item>
        </v-list>
      </template>
    </v-navigation-drawer>

    <v-main class="bg-grey-lighten-3">
      <slot />
    </v-main>

    <v-footer app color="grey-lighten-1" class="justify-center">
      <span class="text-caption">
        &copy; {{ new Date().getFullYear() }} WorkOut with Agent
      </span>
    </v-footer>
  </v-app>
</template>

<style scoped>
.app-bar-title {
  cursor: pointer;
}
</style>
