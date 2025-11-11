import axios from "axios";
import { useLoginStore } from "../stores/loginStore";
import { useNuxtApp } from "#app";

// ✅ interceptor 중복 등록 방지 플래그
let isInterceptorRegistered = false;

// 토큰 갱신 상태 관리
let isRefreshing = false;
let failedRequests: Array<{
  resolve: Function;
  reject: Function;
  originalRequest?: any;
}> = [];

// 로그아웃 처리 함수 (중복 방지)
let isLoggingOut = false;
const handleLogout = async (
  message = "토큰이 만료되었습니다. 다시 로그인해주세요."
) => {
  if (isLoggingOut) return; // 이미 로그아웃 중이면 무시

  isLoggingOut = true;
  // console.log("Handling logout...");

  try {
    const { $pinia } = useNuxtApp();
    const loginStore = useLoginStore($pinia);
    await loginStore.logout();

    // alert 대신 한 번만 표시 (클라이언트 사이드에서만)
    if (import.meta.client && !window.location.href.includes("/login")) {
      alert(message);
      window.location.href = "/login";
      return;
    }
  } catch (error) {
    // console.error("Logout error:", error);
  } finally {
    // 상태 초기화
    isRefreshing = false;
    isLoggingOut = false;
    failedRequests = [];
  }
};

export default defineNuxtPlugin((nuxtApp) => {
  // Nuxt runtimeConfig에서 환경변수 가져오기
  const config = useRuntimeConfig();

  // ✅ SSR 환경에서는 Docker 내부 네트워크 주소 사용
  // 클라이언트에서는 nginx를 통한 외부 주소 사용
  const baseURL =
    import.meta.server && config.apiBaseServer
      ? (config.apiBaseServer as string)
      : (config.public.apiBase as string);

  const authURL = baseURL + "/auth";

  // console.log(
  //   `🌐 Axios 환경: ${import.meta.server ? "SSR (서버)" : "클라이언트"}`
  // );
  // console.log(`🌐 API Base URL: ${baseURL}`);

  // ✅ axios defaults 설정
  axios.defaults.baseURL = baseURL;
  axios.defaults.withCredentials = true;

  // ✅ interceptor 중복 등록 방지
  if (isInterceptorRegistered) {
    // console.log("⚠️ Interceptor already registered, skipping...");
    return {
      provide: {
        axios: axios,
      },
    };
  }

  isInterceptorRegistered = true;
  // console.log("✅ Registering axios interceptors...");

  // 액세스토큰 갱신 함수
  const refreshAccessToken = async (): Promise<string> => {
    // console.log("refreshAccessToken: Function invoked");
    try {
      const response = await axios.get(`${authURL}/refresh-token`, {
        withCredentials: true,
      });
      return response.data?.accessToken;
    } catch (error) {
      // console.log("Token refresh failed:", error);
      throw error;
    }
  };

  axios.interceptors.request.use(
    async (config) => {
      // console.log(
      //     "✅ Axios Request Interceptor triggered for URL:",
      //   config.url
      // );
      const ignoreInterceptor = ["/auth/logout"];
      if (ignoreInterceptor.some((url) => config.url?.includes(url))) {
        return config;
      }
      // Authorization 헤더에 메모리 토큰 주입
      try {
        // ✅ SSR 환경에서는 토큰 주입 시도하지 않고 그냥 진행
        // (공개 API는 토큰 없이도 작동해야 함)
        if (!import.meta.client) {
          // console.log("SSR 환경: 토큰 없이 요청 진행");
          config.withCredentials = true;
          return config;
        }

        // console.log("토큰 주입중..");
        const { $pinia } = useNuxtApp();
        const loginStore = useLoginStore($pinia);

        // ✅ Pinia store의 ref는 자동으로 unwrap되므로 직접 접근
        const token = loginStore.accessToken ?? null;

        // localStorage 동기화
        if (loginStore && loginStore.user) {
          localStorage.setItem("user", JSON.stringify(loginStore.user));
        }

        console.log("토큰", token);
        if (typeof token === "string" && token.length > 0) {
          // console.log("토큰 주입완료");
          config.headers = config.headers || {};
          (config.headers as any)["Authorization"] = `Bearer ${token}`;
        } else {
          // console.log("토큰이 없거나 유효하지 않음:", token);
        }
      } catch (e) {
        console.error(
          // "Error in Axios request interceptor while getting token:",
          e
        );
        // 에러가 나도 요청은 계속 진행 (공개 API를 위해)
      }
      config.withCredentials = true;
      return config;
    },
    (error) => {
      // console.error("Request interceptor error:", error);
      return Promise.reject(error);
    }
  );

  // 응답 인터셉터
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      // ✅ SSR 환경에서는 토큰 갱신 로직 건너뛰고 에러 반환
      if (!import.meta.client) {
        // console.error("SSR 환경에서 API 에러:", error.message);
        return Promise.reject(error);
      }

      // logError("API 요청", error);

      const originalRequest = error.config;
      const isUserInfoRequest = originalRequest.url?.includes(
        "/api/v1/member/userinfo"
      );

      // 로그인 요청은 무시
      if (originalRequest.url?.includes("/api/v1/login/jwt")) {
        return Promise.reject(error);
      }

      // 이미 로그아웃 중이면 모든 요청 중단
      if (isLoggingOut) {
        return Promise.reject(new Error("User is being logged out"));
      }

      // 토큰 갱신 요청에서 401/403 에러가 발생했다면 바로 로그아웃
      if (
        originalRequest.url?.includes("/api/v1/refresh-token") &&
        (error.response?.status === 401 || error.response?.status === 403)
      ) {
        // console.log("Refresh token expired or invalid, logging out");
        await handleLogout("세션이 만료되었습니다. 다시 로그인해주세요.");
        return Promise.reject(error);
      }
      if (error.response?.status === 403) {
        await handleLogout("접근권한이 없습니다. 로그아웃 됩니다");
        return Promise.reject(error);
      }

      // 401 Unauthorized 응답 처리 (토큰 만료 시)
      if (error.response?.status === 401 && !originalRequest._retry) {
        // console.log("401 error detected, attempting token refresh");

        // 이미 토큰 갱신 중이면 큐에 추가하고 대기
        if (isRefreshing) {
          //    console.log("Adding request to queue while refreshing");
          return new Promise((resolve, reject) => {
            failedRequests.push({
              resolve: () => {
                // console.log("Retrying queued request");
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers["X-Retry-Request"] = "true";
                resolve(axios(originalRequest));
              },
              reject: (err: any) => {
                reject(err);
              },
              originalRequest: originalRequest,
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        // console.log("Starting token refresh for request:", originalRequest.url);

        try {
          // console.log("리프레시토큰 요청중..");
          const newToken = await refreshAccessToken();

          // ✅ Store에 새 토큰 저장
          try {
            const { $pinia } = useNuxtApp();
            const loginStore = useLoginStore($pinia);
            // ✅ ref 객체에 직접 할당 (Pinia의 ref는 자동으로 unwrap됨)
            if (loginStore) {
              loginStore.accessToken = newToken || null;
            }

            // ✅ localStorage에 user가 없으면 userinfo 자동 요청
            if (import.meta.client) {
              const storedUser = localStorage.getItem("user");
              if (!storedUser && loginStore.accessToken) {
                // console.log(
                //   "토큰 갱신 성공, user 정보 없음 -> userinfo 요청 시도"
                // );
                try {
                  const userInfoResponse = await axios.get(
                    `${baseURL}/member/userinfo`,
                    {
                      withCredentials: true,
                      headers: {
                        Authorization: `Bearer ${newToken}`,
                      },
                    }
                  );

                  // ✅ Pinia store에 직접 할당
                  loginStore.user = userInfoResponse.data;
                  loginStore.isLogin = true;
                  localStorage.setItem(
                    "user",
                    JSON.stringify(userInfoResponse.data)
                  );
                  // console.log(
                  //   "✅ 사용자 정보 자동 복구 완료:",
                  //   userInfoResponse.data
                  // );
                } catch (userInfoError) {
                  // console.error("userinfo 요청 실패:", userInfoError);
                  // userinfo 실패 시에도 토큰 갱신은 성공했으므로 요청은 재시도
                }
              }
            }
          } catch (storeError) {
            // console.error("Store 업데이트 실패:", storeError);
          }

          // 대기 중인 요청들을 새 토큰으로 재시도
          const retryPromises = failedRequests.map(({ resolve }) => {
            return resolve();
          });

          failedRequests = [];
          isRefreshing = false;

          // 모든 대기 중인 요청 완료 대기
          await Promise.all(retryPromises);

          // 현재 요청도 새 토큰으로 재시도 (Rate Limit 중복 방지 헤더 추가)
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers["X-Retry-Request"] = "true";
          return axios(originalRequest);
        } catch (refreshError) {
          // console.error("Token refresh failed:", refreshError);
          isRefreshing = false;

          // 대기 중인 요청들 모든 실패 처리
          failedRequests.forEach(({ reject }) => {
            reject(refreshError);
          });
          failedRequests = [];

          // 🔥 리프레시 토큰 만료 시 강제 로그아웃
          await handleLogout("세션이 만료되었습니다. 다시 로그인해주세요.");
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return {
    provide: {
      axios: axios,
    },
  };
});
