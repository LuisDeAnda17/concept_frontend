<template>
  <div class="class-assignments">
    <!-- <header class="header">
      <div class="header-left">
        <button @click="goBack" class="btn btn-secondary">← Back</button>
        <h1>{{ classItem?.name || "Class Assignments" }}</h1>
      </div>
      <div class="header-right">
        <span>{{ authStore.user?.username }}</span>
        <button @click="handleLogout" class="btn btn-secondary">Logout</button>
      </div> -->
    <!-- </header> -->

    <main class="main-content">
      <div class="class-info">
        <div class="class-info-left">
          <button @click="goBack" class="btn btn-secondary">← Back</button>
        </div>
        <div class="class-info-right">
            <h2>{{ classItem?.name }}</h2>
            <p class="overview">{{ classItem?.overview }}</p>
        </div>
      </div>

      <div class="assignments-section">
        <div class="section-header">
          <h3>Assignments</h3>
          <button
            @click="showCreateAssignmentModal = true"
            class="btn btn-primary"
          >
            Add Assignment
          </button>
        </div>

        <div v-if="isLoading" class="loading">Loading assignments...</div>

        <div v-else-if="assignments.length === 0" class="empty-state">
          <p>No assignments found for this class.</p>
        </div>

        <div v-else class="assignments-list">
          <div
            v-for="assignment in assignments"
            :key="assignment._id"
            class="assignment-item"
          >
            <div class="assignment-info">
              <h4>{{ assignment.name }}</h4>
              <p class="due-date">Due: {{ formatDate(assignment.dueDate) }}</p>
            </div>
            <div class="assignment-actions">
              <button
                @click="editAssignment(assignment)"
                class="btn btn-sm btn-outline"
              >
                Edit
              </button>
              <button
                @click="deleteAssignment(assignment)"
                class="btn btn-sm btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Create Assignment Modal -->
    <div
      v-if="showCreateAssignmentModal"
      class="modal-overlay"
      @click="showCreateAssignmentModal = false"
    >
      <div class="modal" @click.stop>
        <h3>Create New Assignment</h3>
        <form @submit.prevent="handleCreateAssignment">
          <div class="form-group">
            <label>Assignment Name</label>
            <input v-model="newAssignmentName" type="text" required />
          </div>
          <div class="form-group">
            <label>Due Date</label>
            <input
              v-model="newAssignmentDueDate"
              type="datetime-local"
              required
            />
          </div>
          <div class="modal-actions">
            <button
              type="button"
              @click="showCreateAssignmentModal = false"
              class="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" :disabled="isLoading" class="btn btn-primary">
              {{ isLoading ? "Creating..." : "Create Assignment" }}
            </button>
          </div>
        </form>
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
import type { Class, Assignment } from "../types/api";

const router = useRouter();
const authStore = useAuthStore();
const brontoBoardStore = useBrontoBoardStore();

const props = defineProps<{
  id: string;
  classId: string;
}>();

const classItem = ref<Class | null>(null);
const assignments = ref<Assignment[]>([]);
const showCreateAssignmentModal = ref(false);
const newAssignmentName = ref("");
const newAssignmentDueDate = ref("");

const isLoading = computed(() => brontoBoardStore.isLoading);
const error = computed(() => brontoBoardStore.error);

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

    // Load classes and find the specific class
    await brontoBoardStore.loadClassesForBrontoBoard(props.id);
    classItem.value =
      brontoBoardStore.currentClasses.find((c) => c._id === props.classId) ||
      null;

    // Load assignments for this class
    await loadAssignments();
  } catch (err) {
    console.error("Failed to load class assignments:", err);
  }
});

async function loadAssignments() {
  try {
    await brontoBoardStore.loadAssignmentsForClass(props.classId);
    assignments.value = brontoBoardStore.currentAssignments;
  } catch (err) {
    console.error("Failed to load assignments:", err);
  }
}

function goBack() {
  router.push(`/bronto-board/${props.id}`);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return (
    date.toLocaleDateString() +
    " " +
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
}

function editAssignment(assignment: Assignment) {
  // TODO: Implement edit functionality
  alert(`Edit assignment: ${assignment.name}`);
}

async function deleteAssignment(assignment: Assignment) {
  if (confirm(`Are you sure you want to delete "${assignment.name}"?`)) {
    try {
      await brontoBoardStore.deleteAssignment(assignment._id);
      await loadAssignments(); // Reload assignments
    } catch (err) {
      console.error("Failed to delete assignment:", err);
    }
  }
}

async function handleCreateAssignment() {
  try {
    const isoDate = new Date(newAssignmentDueDate.value).toISOString();

    await brontoBoardStore.addAssignment(
      props.classId,
      newAssignmentName.value,
      isoDate
    );

    showCreateAssignmentModal.value = false;
    newAssignmentName.value = "";
    newAssignmentDueDate.value = "";

    // Reload assignments
    await loadAssignments();
  } catch (err) {
    console.error("Failed to create assignment:", err);
  }
}
</script>

<style scoped>
.class-assignments {
  min-height: 100vh;
  background: #7189FF;
}

.header {
  background: white;
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

.header-right span {
  color: #7f8c8d;
  font-weight: 500;
}

.main-content {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.class-info {
  background: #AFD2E9;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative; /* allows absolute positioning of center content */
  display: flex;
  align-items: center;
  justify-content: flex-start; /* back button stays on left */
  border-bottom: 1px solid #ddd;
  min-height: 80px; /* optional: keeps consistent height */
}

.class-info h2 {
  color: #2c3e50;
  margin-bottom: 10px;
}

/* Left section: Back button */
.class-info-left {
  flex-shrink: 0;
}

/* Center section: Class title and overview */
.class-info-right {
  position: absolute;
  left: 50%;
  transform: translateX(-50%); /* perfectly centers horizontally */
  text-align: center;
}

.class-info-right h2 {
  margin: 0;
  font-size: 1.4rem;
  color: #2c3e50;
}

.class-info-right .overview {
  margin: 0.25rem 0 0;
  color: #7f8c8d;
  font-size: 0.95rem;
}

.overview {
  color: #7f8c8d;
  line-height: 1.5;
}

.assignments-section {
  background: #AFD2E9;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  color: #2c3e50;
  margin: 0;
}

.assignments-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.assignment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #e1e8ed;
  border-radius: 6px;
  background: #A1C349;
}

.assignment-info h4 {
  color: #2c3e50;
  margin: 0 0 5px 0;
}

.due-date {
  color: #7f8c8d;
  margin: 0;
  font-size: 14px;
}

.assignment-actions {
  display: flex;
  gap: 10px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  background: #256b34;
  color: white;
  border: 1px solid #667eea;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
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
  padding: 10px;
  border: 2px solid #e1e8ed;
  border-radius: 6px;
  font-size: 16px;
  font-family: inherit;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
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
