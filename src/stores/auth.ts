import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { apiService } from "../services/api";
import type { User } from "../types/api";

export const useAuthStore = defineStore("auth", () => {
  // State
  const user = ref<User | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

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
      return response;
    } catch (err: any) {
      error.value = err.response?.data?.error || "Registration failed";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  function logout() {
    user.value = null;
    error.value = null;
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
    // Actions
    login,
    register,
    logout,
    clearError,
  };
});
