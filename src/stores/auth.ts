import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { apiService } from "../services/api";
import type { User } from "../types/api";

export const useAuthStore = defineStore("auth", () => {
  // State
  const user = ref<User | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const sessionId = ref<string | null>(null);

  // Initialize from localStorage on load (if available)
  if (typeof window !== "undefined") {
    try {
      const storedSession = window.localStorage.getItem("sessionId");
      if (storedSession) {
        sessionId.value = storedSession;
      }
    } catch (_) {
      // ignore storage errors
    }
  }

  // Getters
  const isAuthenticated = computed(() => !!user.value);
  const userId = computed(() => user.value?._id || null);

  // Actions
  async function login(username: string, password: string) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiService.authenticate({ username, password });
      // For now, we'll create a minimal user object since the API only returns user ID
      user.value = {
        _id: response.user,
        username: username,
      };
      // Create a session and persist the sessionId
      const sessionResp = await apiService.createSession(response.user);
      sessionId.value = sessionResp.session;
      try {
        window.localStorage.setItem("sessionId", sessionResp.session);
      } catch (_) {}
      return response;
    } catch (err: any) {
      error.value = err.response?.data?.error || "Login failed";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function register(username: string, password: string) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiService.register({ username, password });
      // For now, we'll create a minimal user object since the API only returns user ID
      user.value = {
        _id: response.user,
        username: username,
      };
      // Create a session for new user as well and persist it
      const sessionResp = await apiService.createSession(response.user);
      sessionId.value = sessionResp.session;
      try {
        window.localStorage.setItem("sessionId", sessionResp.session);
      } catch (_) {}
      return response;
    } catch (err: any) {
      error.value = err.response?.data?.error || "Registration failed";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function logout() {
    try {
      if (sessionId.value) {
        await apiService.deleteSession(sessionId.value);
      }
    } catch (_) {
      // ignore errors on logout
    } finally {
      user.value = null;
      error.value = null;
      sessionId.value = null;
      try {
        window.localStorage.removeItem("sessionId");
      } catch (_) {}
    }
  }

  function clearError() {
    error.value = null;
  }

  return {
    // State
    user,
    isLoading,
    error,
    // Getters
    isAuthenticated,
    userId,
    sessionId,
    // Actions
    login,
    register,
    logout,
    clearError,
  };
});
