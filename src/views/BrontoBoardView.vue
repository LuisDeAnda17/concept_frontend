<template>
  <div class="bronto-board">
    <header class="header">
      <div class="header-left">
        <button @click="goBack" class="btn btn-secondary">← Back</button>
        <h1>BrontoBoard</h1>
      </div>
      <div class="header-right">
        <span>{{ authStore.user?.username }}</span>
        <button @click="handleLogout" class="btn btn-secondary">Logout</button>
      </div>
    </header>

    <main class="main-content">
      <div class="classes-section">
        <div class="section-header">
          <h2>Classes</h2>
          <div class="header-actions">
            <button @click="goToCalendar" class="btn btn-outline">
              📅 Calendar
            </button>
            <button
              @click="showCreateAssignmentModal = true"
              class="btn btn-secondary"
            >
              Create Assignment
            </button>
            <button
              @click="showCreateClassModal = true"
              class="btn btn-primary"
            >
              Add Class
            </button>
          </div>
        </div>

        <div v-if="isLoading" class="loading">Loading classes...</div>

        <div
          v-else-if="brontoBoardStore.currentClasses.length === 0"
          class="empty-state"
        >
          <p>No classes found. Add your first class!</p>
        </div>

        <div v-else class="classes-grid">
          <div
            v-for="classItem in brontoBoardStore.currentClasses"
            :key="classItem._id"
            class="class-card"
            @click="selectClass(classItem)"
          >
            <h3>{{ classItem.name }}</h3>
            <p>{{ classItem.overview }}</p>
            <div class="class-actions">
              <button
                @click.stop="viewAssignments(classItem)"
                class="btn btn-sm btn-outline"
              >
                View Assignments
              </button>
              <button
                @click.stop="viewOfficeHours(classItem)"
                class="btn btn-sm btn-outline"
              >
                View Office Hours
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Create Class Modal -->
    <div
      v-if="showCreateClassModal"
      class="modal-overlay"
      @click="showCreateClassModal = false"
    >
      <div class="modal" @click.stop>
        <h3>Create New Class</h3>
        <form @submit.prevent="handleCreateClass">
          <div class="form-group">
            <label>Class Name</label>
            <input v-model="newClassName" type="text" required />
          </div>
          <div class="form-group">
            <label>Overview</label>
            <textarea v-model="newClassOverview" rows="3" required></textarea>
          </div>
          <div class="modal-actions">
            <button
              type="button"
              @click="showCreateClassModal = false"
              class="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" :disabled="isLoading" class="btn btn-primary">
              {{ isLoading ? "Creating..." : "Create" }}
            </button>
          </div>
        </form>
      </div>
    </div>

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
          <div class="form-group">
            <label>Class</label>
            <select v-model="selectedClassId" required>
              <option value="">Select a class</option>
              <option
                v-for="classItem in brontoBoardStore.currentClasses"
                :key="classItem._id"
                :value="classItem._id"
              >
                {{ classItem.name }}
              </option>
            </select>
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
import type { Class } from "../types/api";

const router = useRouter();
const authStore = useAuthStore();
const brontoBoardStore = useBrontoBoardStore();

const props = defineProps<{
  id: string;
}>();

const showCreateClassModal = ref(false);
const newClassName = ref("");
const newClassOverview = ref("");

const showCreateAssignmentModal = ref(false);
const newAssignmentName = ref("");
const newAssignmentDueDate = ref("");
const selectedClassId = ref("");

const isLoading = computed(() => brontoBoardStore.isLoading);
const error = computed(() => brontoBoardStore.error);

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push("/login");
    return;
  }

  try {
    // First load the BrontoBoards to find the current one
    await brontoBoardStore.loadBrontoBoardsForUser(authStore.userId!);

    // Find and set the current BrontoBoard
    const currentBoard = brontoBoardStore.brontoBoards.find(
      (board) => board._id === props.id
    );
    if (currentBoard) {
      brontoBoardStore.setCurrentBrontoBoard(currentBoard);
    }

    await brontoBoardStore.loadClassesForBrontoBoard(props.id);
  } catch (err) {
    console.error("Failed to load classes:", err);
  }
});

function goBack() {
  router.push("/dashboard");
}

function goToCalendar() {
  router.push(`/bronto-board/${props.id}/calendar`);
}

function selectClass(classItem: Class) {
  // For now, just show a simple alert
  alert(`Selected class: ${classItem.name}`);
}

function viewAssignments(classItem: Class) {
  router.push(`/bronto-board/${props.id}/class/${classItem._id}/assignments`);
}

function viewOfficeHours(classItem: Class) {
  // TODO: Implement office hours view
  alert(`View office hours for: ${classItem.name}`);
}

async function handleCreateClass() {
  try {
    await brontoBoardStore.createClass(
      newClassName.value,
      newClassOverview.value
    );
    showCreateClassModal.value = false;
    newClassName.value = "";
    newClassOverview.value = "";
  } catch (err) {
    console.error("Failed to create class:", err);
  }
}

async function handleCreateAssignment() {
  try {
    // Convert datetime-local to ISO 8601 format
    const isoDate = new Date(newAssignmentDueDate.value).toISOString();

    console.log("Creating assignment with data:", {
      classId: selectedClassId.value,
      name: newAssignmentName.value,
      dueDate: isoDate,
      currentBrontoBoard: brontoBoardStore.currentBrontoBoard.value,
    });

    await brontoBoardStore.addAssignment(
      selectedClassId.value,
      newAssignmentName.value,
      isoDate
    );
    showCreateAssignmentModal.value = false;
    newAssignmentName.value = "";
    newAssignmentDueDate.value = "";
    selectedClassId.value = "";
  } catch (err) {
    console.error("Failed to create assignment:", err);
  }
}

function handleLogout() {
  authStore.logout();
  brontoBoardStore.reset();
  router.push("/login");
}
</script>

<style scoped>
.bronto-board {
  min-height: 100vh;
  background: #f8f9fa;
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  color: #2c3e50;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.classes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.class-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.class-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.class-card h3 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 1.2rem;
}

.class-card p {
  color: #7f8c8d;
  margin-bottom: 15px;
  line-height: 1.5;
}

.class-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
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
  background: transparent;
  color: #667eea;
  border: 1px solid #667eea;
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

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #2c3e50;
  font-weight: 500;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 2px solid #e1e8ed;
  border-radius: 6px;
  font-size: 16px;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
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
