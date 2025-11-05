<template>
  <div class="dashboard">
    <header class="header">
      <!-- <div class="section-header"> -->
      <h2>Your BrontoBoards</h2>
      <button @click="openCreateBoardModal" class="btn btn-primary">
        Create New BrontoBoard
      </button>
      <!-- </div> -->
    </header>

    <main class="main-content">
      <div class="bronto-boards-section">
        <div v-if="isLoading" class="loading">Loading BrontoBoards...</div>

        <div
          v-else-if="brontoBoardStore.brontoBoards.length === 0"
          class="empty-state"
        >
          <p>No BrontoBoards found. Create your first one!</p>
        </div>

        <div v-else class="bronto-boards-grid">
          <div
            v-for="board in brontoBoardStore.brontoBoards"
            :key="board._id"
            class="bronto-board-card"
            @click="selectBrontoBoard(board)"
          >
            <h3>BrontoBoard</h3>
            <p>ID: {{ board._id }}</p>
            <!-- <p>Calendar: {{ board.calendar }}</p> -->
          </div>
        </div>
      </div>
    </main>

    <!-- Create BrontoBoard Modal -->
    <div
      v-if="showCreateBoardModal"
      class="modal-overlay"
      @click="showCreateBoardModal = false"
    >
      <div class="modal" @click.stop>
        <h3>Create New BrontoBoard</h3>
        <p>
          A new calendar will be automatically created for this BrontoBoard.
        </p>

        <!-- Error display in modal -->
        <div v-if="error" class="modal-error">
          <strong>Error:</strong> {{ error }}
        </div>

        <form @submit.prevent="handleCreateBrontoBoard">
          <div class="modal-actions">
            <button
              type="button"
              @click="showCreateBoardModal = false"
              class="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" :disabled="isLoading" class="btn btn-primary">
              {{ isLoading ? "Creating..." : "Create BrontoBoard" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- Success Message -->
    <div v-if="success" class="success-message">
      {{ success }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useBrontoBoardStore } from "../stores/brontoBoard";
import { apiService } from "../services/api";

const router = useRouter();
const authStore = useAuthStore();
const brontoBoardStore = useBrontoBoardStore();

const showCreateBoardModal = ref(false);

const isLoading = computed(() => brontoBoardStore.isLoading);
const error = computed(() => brontoBoardStore.error);
const success = computed(() => brontoBoardStore.success);

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push("/login");
    return;
  }

  try {
    await brontoBoardStore.loadBrontoBoardsForUser(authStore.userId!);
  } catch (err) {
    console.error("Failed to load BrontoBoards:", err);
  }
});

function selectBrontoBoard(board: any) {
  brontoBoardStore.setCurrentBrontoBoard(board);
  router.push(`/bronto-board/${board._id}`);
}

function openCreateBoardModal() {
  // Clear any previous errors and success messages
  brontoBoardStore.clearError();
  brontoBoardStore.clearSuccess();
  showCreateBoardModal.value = true;
}

async function handleCreateBrontoBoard() {
  if (!authStore.userId) return;

  try {
    console.log("Starting BrontoBoard creation for user:", authStore.userId);

    let calendarId: string;

    // Check if user already has a calendar
    console.log("Checking for existing calendar for user:", authStore.userId);
    const existingCalendars = await apiService.getCalendarForUser(
      authStore.userId
    );
    console.log("Existing calendars result:", existingCalendars);
    console.log("Existing calendars type:", typeof existingCalendars);
    console.log(
      "Existing calendars is array:",
      Array.isArray(existingCalendars)
    );
    console.log("Existing calendars length:", existingCalendars?.length);

    if (existingCalendars && existingCalendars.length > 0) {
      // User already has a calendar, reuse it
      calendarId = existingCalendars[0]!._id;
      console.log("Using existing calendar:", calendarId);
    } else {
      // User doesn't have a calendar, create one
      console.log("No existing calendar found. Creating new calendar...");
      const calendarResponse = await apiService.createCalendar({
        user: authStore.userId,
      });
      calendarId = calendarResponse.calendarId;
      console.log("Calendar created:", calendarResponse);
    }

    // Then create the BrontoBoard with the calendar ID
    console.log("Creating BrontoBoard with calendar ID:", calendarId);
    await brontoBoardStore.initializeBrontoBoard(authStore.userId, calendarId);
    console.log("BrontoBoard created successfully");

    // Show success message
    brontoBoardStore.setSuccess("BrontoBoard created successfully!");

    showCreateBoardModal.value = false;

    // Refresh the BrontoBoards list
    await brontoBoardStore.loadBrontoBoardsForUser(authStore.userId);

    // Clear success message after 3 seconds
    setTimeout(() => {
      brontoBoardStore.clearSuccess();
    }, 3000);
  } catch (err: any) {
    console.error("Failed to create BrontoBoard:", err);

    // Set error message for user feedback
    brontoBoardStore.setError(
      err.response?.data?.error ||
        err.message ||
        "Failed to create BrontoBoard. Please try again."
    );

    // Keep modal open so user can retry
    // showCreateBoardModal.value = false;
  }
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #afd2e9;
}

.header {
  background: #7189ff;
  padding: 20px 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h1 {
  color: #2c3e50;
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info span {
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

.bronto-boards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.bronto-board-card {
  background: #a1c349;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.bronto-board-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.bronto-board-card h3 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.bronto-board-card p {
  color: #7f8c8d;
  margin: 5px 0;
  font-size: 14px;
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
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #9e9d9c;
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
  max-width: 400px;
}

.modal h3 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.modal-error {
  background: #fee;
  color: #c33;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  border: 1px solid #fcc;
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

.success-message {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #efe;
  color: #3c3;
  padding: 15px 20px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1001;
}
</style>
