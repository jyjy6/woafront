import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import type { UserInfo } from "~/types/UserInfoTypes";
import axios from "axios";

export const useLoginStore = defineStore("login", () => {
  const isLogin = ref(false);
  const user = ref<UserInfo | null>();
  const accessToken = ref<string | null>(null);
  const router = useRouter();

  // ✅ 앱이 실행될 때 로컬 스토리지에서 유저 정보 불러오기
  const loadUserFromLocalStorage = async () => {
    if (!import.meta.client) return;

    const storedUser = localStorage.getItem("user");
    console.log("로컬스토리지에서 가져온 유저 정보:", storedUser);
    console.log("디버깅" + accessToken.value);
    console.log(isLogin.value);

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        user.value = parsedUser;
        isLogin.value = true;
        console.log("유저 정보 로드 완료:", user.value);
      } catch (e) {
        console.error("유저 정보 파싱 실패", e);
        localStorage.removeItem("user");
        user.value = null;
        isLogin.value = false;
        logout();
      }
    } else if (accessToken.value) {
      // 🔥 SSO: HttpOnly 쿠키는 JS로 접근 불가하므로 바로 API 호출 시도
      console.log("SSO: localStorage에 user 정보 없음, API 호출 시도");
      try {
        const response = await axios.get("/member/userinfo", {
          withCredentials: true,
        });
        user.value = response.data;
        localStorage.setItem("user", JSON.stringify(user.value));
        isLogin.value = true;
        console.log("SSO: 사용자 정보 자동 로드 성공", user.value);
      } catch (error: any) {
        // 401이면 토큰 없음/만료, 다른 에러면 서버 문제
        if (error.response?.status === 401) {
          console.log("SSO: 토큰 없음 또는 만료됨");
        } else {
          console.log("SSO: 서버 오류", error);
        }
      }
    }
  };

  // 클라이언트 사이드에서만 초기 로드 실행
  if (import.meta.client) {
    loadUserFromLocalStorage();

    // 🔥 다른 탭에서 로그아웃 시 현재 탭도 동기화
    window.addEventListener("storage", (e) => {
      if (e.key === "user" && e.newValue === null) {
        console.log("다른 탭에서 로그아웃 감지, 현재 탭도 로그아웃 처리");
        user.value = null;
        isLogin.value = false;
        router.push("/login");
      }
    });
  }

  const login = async (
    username: string,
    password: string
  ): Promise<boolean | undefined> => {
    try {
      const response = await axios.post("/auth/login", {
        username,
        password,
      });

      // ✅ 로그인 응답에서 직접 유저 정보 + accessToken
      user.value = response.data.userInfo;
      accessToken.value = response.data.accessToken;
      console.log("로그인됐음" + accessToken.value);

      localStorage.setItem("user", JSON.stringify(user.value));
      isLogin.value = true;

      alert("로그인 성공!");
      router.push("/");

      return;
    } catch (error: any) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        alert(error.response.data.message);
      } else {
        alert("로그인 중 오류가 발생했습니다.");
      }
    }
  };

  const handleGuestLogin = async () => {
    try {
      const response = await axios.post("/auth/login/guest");

      // ✅ 로그인 응답에서 직접 유저 정보 + accessToken
      user.value = response.data.userInfo;
      accessToken.value = response.data.accessToken ?? null;
      localStorage.setItem("user", JSON.stringify(user.value));
      isLogin.value = true;

      alert("게스트 로그인 성공!");
      router.go(-1);

      return;
    } catch (error: any) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        alert(error.response.data.message);
      } else {
        alert("로그인 중 오류가 발생했습니다.");
      }
    }
  };

  const logout = async () => {
    try {
      // 서버에 로그아웃 알림 (HTTP Only 쿠키(refreshToken, accessToken) 삭제를 위해)
      await axios.post("/auth/logout", {});

      if (import.meta.client) {
        // 로컬 스토리지 정리
        localStorage.removeItem("user");
        localStorage.removeItem("userPlaylist"); // 플레이리스트도 삭제
        // localStorage.removeItem("accessToken"); // Removed as accessToken is cookie-based
      }

      // 상태 업데이트
      user.value = null;
      isLogin.value = false;
      accessToken.value = null;

      // 로그인 페이지로 리다이렉트
      router.push("/login");

      return true;
    } catch (error) {
      console.error("로그아웃 중 오류:", error);
      return false;
    }
  };

  // ✅ 컴포넌트에서 `user?.username` 이런 방식으로 쉽게 접근 가능하도록 Getter 제공
  const isAuthenticated = computed(() => isLogin.value);
  const getUser = computed(() => user.value);
  const getAccessToken = computed(() => accessToken.value);

  return {
    isLogin,
    user,
    accessToken,
    isAuthenticated,
    getUser,
    getAccessToken,
    login,
    logout,
    loadUserFromLocalStorage,
    handleGuestLogin,
  };
});
