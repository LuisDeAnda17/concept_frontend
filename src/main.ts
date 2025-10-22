import { createApp } from "vue";
import { createPinia } from "pinia";
import { createRouter, createWebHistory } from "vue-router";
import "./style.css";
import App from "./App.vue";

// Import components
import LoginView from "./views/LoginView.vue";
import DashboardView from "./views/DashboardView.vue";
import BrontoBoardView from "./views/BrontoBoardView.vue";
import ClassAssignmentsView from "./views/ClassAssignmentsView.vue";
import CalendarView from "./views/CalendarView.vue";

// Define routes
const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: LoginView },
  { path: "/dashboard", component: DashboardView },
  { path: "/bronto-board/:id", component: BrontoBoardView, props: true },
  {
    path: "/bronto-board/:id/class/:classId/assignments",
    component: ClassAssignmentsView,
    props: true,
  },
  {
    path: "/bronto-board/:id/calendar",
    component: CalendarView,
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);
app.mount("#app");
