<template>
  <nav class="navbar">
    <div class="navbar-left">
        <h1 class="logo">BrontoBoard</h1>
        <div class="nav-links">
            <RouterLink to="/dashboard" exact-active-class="active">Dashboard</RouterLink>
        </div>
    </div>
    <div class="user-info">
        <span>Welcome, {{ authStore.user?.username }}</span>
        <button @click="handleLogout" class="btn btn-secondary">Logout</button>
    </div>
  </nav>
</template>

<script setup lang="ts">
// import { useRoute } from "vue-router";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useBrontoBoardStore } from "../stores/brontoBoard";

const router = useRouter();
const authStore = useAuthStore();
const brontoBoardStore = useBrontoBoardStore();

// Access route params dynamically (for links like /bronto-board/:id)
// const route = useRoute();
// const brontoId = route.params.id;
// const classId = route.params.classId;


function handleLogout() {
  authStore.logout();
  brontoBoardStore.reset();
  router.push("/login");
}
</script>

<style scoped>
.navbar {
  flex-shrink: 0;
  height: 60px;
  background-color: #416165;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 20px; /* space between logo and nav links */
}

.logo {
  font-size: 1.3rem;
  font-weight: bold;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-links a {
  color: #fff;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-links a:hover,
.nav-links a.active {
  color: #42b983;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #c9de37;
  color: white;
}

.btn-secondary:hover {
  background: #DA2C38;
}
</style>
