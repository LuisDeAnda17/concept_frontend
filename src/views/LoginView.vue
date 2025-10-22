<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="title">BrontoBoard</h1>
      <p class="subtitle">Manage your classes, assignments, and office hours</p>

      <div class="form-container">
        <div v-if="isLogin" class="form-section">
          <h2>Login</h2>
          <form @submit.prevent="handleLogin">
            <div class="form-group">
              <label for="login-username">Username</label>
              <input
                id="login-username"
                v-model="loginForm.username"
                type="text"
                required
                :disabled="isLoading"
              />
            </div>
            <div class="form-group">
              <label for="login-password">Password</label>
              <input
                id="login-password"
                v-model="loginForm.password"
                type="password"
                required
                :disabled="isLoading"
              />
            </div>
            <button type="submit" :disabled="isLoading" class="btn btn-primary">
              {{ isLoading ? "Logging in..." : "Login" }}
            </button>
          </form>
        </div>

        <div v-else class="form-section">
          <h2>Register</h2>
          <form @submit.prevent="handleRegister">
            <div class="form-group">
              <label for="register-username">Username</label>
              <input
                id="register-username"
                v-model="registerForm.username"
                type="text"
                required
                :disabled="isLoading"
              />
            </div>
            <div class="form-group">
              <label for="register-password">Password</label>
              <input
                id="register-password"
                v-model="registerForm.password"
                type="password"
                required
                :disabled="isLoading"
              />
            </div>
            <button type="submit" :disabled="isLoading" class="btn btn-primary">
              {{ isLoading ? "Registering..." : "Register" }}
            </button>
          </form>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="toggle-form">
          <button @click="toggleForm" class="btn btn-link">
            {{
              isLogin
                ? "Don't have an account? Register"
                : "Already have an account? Login"
            }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const isLogin = ref(true);
const loginForm = ref({
  username: "",
  password: "",
});
const registerForm = ref({
  username: "",
  password: "",
});

const isLoading = computed(() => authStore.isLoading);
const error = computed(() => authStore.error);

function toggleForm() {
  isLogin.value = !isLogin.value;
  authStore.clearError();
}

async function handleLogin() {
  try {
    await authStore.login(loginForm.value.username, loginForm.value.password);
    router.push("/dashboard");
  } catch (err) {
    // Error is handled by the store
  }
}

async function handleRegister() {
  try {
    await authStore.register(
      registerForm.value.username,
      registerForm.value.password
    );
    router.push("/dashboard");
  } catch (err) {
    // Error is handled by the store
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.title {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 2.5rem;
  font-weight: bold;
}

.subtitle {
  text-align: center;
  color: #7f8c8d;
  margin-bottom: 30px;
  font-size: 1.1rem;
}

.form-container {
  width: 100%;
}

.form-section h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #2c3e50;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e8ed;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5a6fd8;
  transform: translateY(-1px);
}

.btn-link {
  background: none;
  color: #667eea;
  text-decoration: underline;
  font-size: 14px;
  padding: 8px;
}

.btn-link:hover {
  color: #5a6fd8;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  text-align: center;
  border: 1px solid #fcc;
}

.toggle-form {
  text-align: center;
  margin-top: 20px;
}
</style>
