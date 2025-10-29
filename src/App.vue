<script setup lang="ts">
import { RouterView, useRoute } from "vue-router";
import NavBar from "./components/NavBar.vue";

const route = useRoute();
</script>

<template>
  <div id="app">
    <!-- Only show navbar when not on login -->
    <NavBar v-if="route.path !== '/login'" />

    <!-- Main content -->
    <main class="content">
    <RouterView/>
    </main>
  </div>
</template>


<style>
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  /* font-family: Avenir, Helvetica, Arial, sans-serif; */
  color: #2c3e50;
}

.content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem;
}

/* Transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

* {
  box-sizing: border-box;
}
</style>
