<template>
  <div class="calendar-view">
    <header class="header">
      <div class="header-left">
        <button @click="goBack" class="btn btn-secondary">← Back</button>
        <h1>Calendar</h1>
      </div>
      <div class="header-right">
        <div class="calendar-controls">
          <button @click="previousMonth" class="btn btn-sm btn-outline">
            ←
          </button>
          <span class="month-year">{{ currentMonthYear }}</span>
          <button @click="nextMonth" class="btn btn-sm btn-outline">→</button>
        </div>
      </div>
    </header>

    <main class="main-content">
      <div class="calendar-container">
        <div class="calendar-header">
          <div class="day-header" v-for="day in weekDays" :key="day">
            {{ day }}
          </div>
        </div>
        <div class="calendar-grid">
          <div
            v-for="day in calendarDays"
            :key="day.date"
            class="calendar-day"
            :class="{ 'other-month': !day.isCurrentMonth }"
          >
            <div class="day-number">{{ day.dayNumber }}</div>
            <div class="assignments">
              <div
                v-for="assignment in day.assignments"
                :key="assignment._id"
                class="assignment-item"
                :class="getAssignmentClass(assignment)"
                @click="viewAssignment(assignment)"
              >
                <span class="assignment-name">{{ assignment.name }}</span>
                <span class="assignment-time">{{
                  formatTime(assignment.dueDate)
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Assignment Detail Modal -->
    <div
      v-if="selectedAssignment"
      class="modal-overlay"
      @click="selectedAssignment = null"
    >
      <div class="modal" @click.stop>
        <h3>{{ selectedAssignment.name }}</h3>
        <div class="assignment-details">
          <p>
            <strong>Class:</strong>
            {{ getClassName(selectedAssignment.classId) }}
          </p>
          <p>
            <strong>Due Date:</strong>
            {{ formatDate(selectedAssignment.dueDate) }}
          </p>
        </div>
        <div class="modal-actions">
          <button
            type="button"
            @click="selectedAssignment = null"
            class="btn btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useBrontoBoardStore } from "../stores/brontoBoard";
import type { Assignment, Class } from "../types/api";

const router = useRouter();
const authStore = useAuthStore();
const brontoBoardStore = useBrontoBoardStore();

const props = defineProps<{
  id: string;
}>();

const currentDate = ref(new Date());
const selectedAssignment = ref<Assignment | null>(null);
const allAssignments = ref<Assignment[]>([]);

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const isLoading = computed(() => brontoBoardStore.isLoading);
const error = computed(() => brontoBoardStore.error);

const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
});

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const days = [];
  const currentDateObj = new Date(startDate);

  // Generate 42 days (6 weeks)
  for (let i = 0; i < 42; i++) {
    const dayAssignments = allAssignments.value.filter((assignment) => {
      const assignmentDate = new Date(assignment.dueDate);
      return (
        assignmentDate.getDate() === currentDateObj.getDate() &&
        assignmentDate.getMonth() === currentDateObj.getMonth() &&
        assignmentDate.getFullYear() === currentDateObj.getFullYear()
      );
    });

    days.push({
      date: currentDateObj.toISOString().split("T")[0],
      dayNumber: currentDateObj.getDate(),
      isCurrentMonth: currentDateObj.getMonth() === month,
      assignments: dayAssignments,
    });

    currentDateObj.setDate(currentDateObj.getDate() + 1);
  }

  return days;
});

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push("/login");
    return;
  }

  try {
    // Load BrontoBoards and set current one
    await brontoBoardStore.loadBrontoBoardsForUser(authStore.userId!);
    const currentBoard = brontoBoardStore.brontoBoards.find(
      (board) => board._id === props.id
    );
    if (currentBoard) {
      brontoBoardStore.setCurrentBrontoBoard(currentBoard);
    }

    // Load classes
    await brontoBoardStore.loadClassesForBrontoBoard(props.id);

    // Load assignments for all classes
    await loadAllAssignments();
  } catch (err) {
    console.error("Failed to load calendar data:", err);
  }
});

async function loadAllAssignments() {
  try {
    const assignments: Assignment[] = [];

    for (const classItem of brontoBoardStore.currentClasses) {
      await brontoBoardStore.loadAssignmentsForClass(classItem._id);
      assignments.push(...brontoBoardStore.currentAssignments);
    }

    allAssignments.value = assignments;
  } catch (err) {
    console.error("Failed to load assignments:", err);
  }
}

function goBack() {
  router.push(`/bronto-board/${props.id}`);
}

function previousMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  );
}

function nextMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return (
    date.toLocaleDateString() +
    " " +
    date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getClassName(classId: string): string {
  const classItem = brontoBoardStore.currentClasses.find(
    (c) => c._id === classId
  );
  return classItem?.name || "Unknown Class";
}

function getAssignmentClass(assignment: Assignment): string {
  const dueDate = new Date(assignment.dueDate);
  const now = new Date();
  const diffDays = Math.ceil(
    (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return "overdue";
  if (diffDays <= 1) return "due-soon";
  if (diffDays <= 7) return "due-week";
  return "due-later";
}

function viewAssignment(assignment: Assignment) {
  selectedAssignment.value = assignment;
}

function handleLogout() {
  authStore.logout();
  brontoBoardStore.reset();
  router.push("/login");
}
</script>

<style scoped>
.calendar-view {
  min-height: 100vh;
  background: #f8f9fa;
}

.header {
  background: #7189FF;
  padding: 20px 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-left h1 {
  color: #2c3e50;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.calendar-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.month-year {
  font-weight: 500;
  color: #2c3e50;
  min-width: 150px;
  text-align: center;
}

.header-right span {
  color: white;
  font-weight: 500;
}

.main-content {
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

.calendar-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #667eea;
  color: white;
}

.day-header {
  padding: 15px;
  text-align: center;
  font-weight: 500;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  min-height: 600px;
}

.calendar-day {
  border: 1px solid #e1e8ed;
  min-height: 100px;
  padding: 8px;
  background: white;
  position: relative;
}

.calendar-day.other-month {
  background: #f8f9fa;
  color: #adb5bd;
}

.day-number {
  font-weight: 500;
  margin-bottom: 5px;
  color: #2c3e50;
}

.assignments {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.assignment-item {
  background: #e3f2fd;
  border-radius: 3px;
  padding: 2px 4px;
  cursor: pointer;
  font-size: 11px;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
}

.assignment-item:hover {
  transform: scale(1.02);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.assignment-item.overdue {
  background: #ffebee;
  border-left: 3px solid #f44336;
}

.assignment-item.due-soon {
  background: #fff3e0;
  border-left: 3px solid #ff9800;
}

.assignment-item.due-week {
  background: #e8f5e8;
  border-left: 3px solid #4caf50;
}

.assignment-item.due-later {
  background: #e3f2fd;
  border-left: 3px solid #2196f3;
}

.assignment-name {
  font-weight: 500;
  color: #2c3e50;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.assignment-time {
  color: #7f8c8d;
  font-size: 10px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 14px;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5a6fd8;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-outline {
  background: transparent;
  color: white;
  border: 1px solid white;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
}

.modal h3 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.assignment-details p {
  margin-bottom: 10px;
  color: #2c3e50;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.error-message {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #fee;
  color: #c33;
  padding: 15px 20px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1001;
}
</style>
