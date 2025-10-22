import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { apiService } from "../services/api";
import type { BrontoBoard, Class, Assignment, OfficeHours } from "../types/api";

export const useBrontoBoardStore = defineStore("brontoBoard", () => {
  // State
  const brontoBoards = ref<BrontoBoard[]>([]);
  const currentBrontoBoard = ref<BrontoBoard | null>(null);
  const classes = ref<Class[]>([]);
  const assignments = ref<Assignment[]>([]);
  const officeHours = ref<OfficeHours[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const success = ref<string | null>(null);

  // Getters
  const currentClasses = computed(() => classes.value);
  const currentAssignments = computed(() => assignments.value);
  const currentOfficeHours = computed(() => officeHours.value);

  // Actions
  async function initializeBrontoBoard(userId: string, calendarId: string) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiService.initializeBB({
        user: userId,
        calendar: calendarId,
      });
      const newBrontoBoard: BrontoBoard = {
        _id: response.brontoBoard,
        owner: userId,
        calendar: calendarId,
      };
      brontoBoards.value.push(newBrontoBoard);
      currentBrontoBoard.value = newBrontoBoard;
      return response;
    } catch (err: any) {
      error.value =
        err.response?.data?.error || "Failed to initialize BrontoBoard";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function createClass(className: string, overview: string) {
    if (!currentBrontoBoard.value) {
      throw new Error("No BrontoBoard selected");
    }

    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiService.createClass({
        owner: currentBrontoBoard.value.owner,
        brontoBoard: currentBrontoBoard.value._id,
        className,
        overview,
      });

      const newClass: Class = {
        _id: response.class,
        brontoBoardId: currentBrontoBoard.value._id,
        name: className,
        overview,
      };

      classes.value.push(newClass);
      return response;
    } catch (err: any) {
      error.value = err.response?.data?.error || "Failed to create class";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function addAssignment(
    classId: string,
    workName: string,
    dueDate: string
  ) {
    if (!currentBrontoBoard.value) {
      throw new Error("No BrontoBoard selected");
    }

    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiService.addWork({
        owner: currentBrontoBoard.value.owner,
        class: classId,
        workName,
        dueDate,
      });

      const newAssignment: Assignment = {
        _id: response.assignment,
        classId,
        name: workName,
        dueDate,
      };

      assignments.value.push(newAssignment);
      return response;
    } catch (err: any) {
      error.value = err.response?.data?.error || "Failed to add assignment";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function addOfficeHours(
    classId: string,
    startTime: string,
    duration: number
  ) {
    if (!currentBrontoBoard.value) {
      throw new Error("No BrontoBoard selected");
    }

    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiService.addOH({
        owner: currentBrontoBoard.value.owner,
        class: classId,
        OHTime: startTime,
        OHduration: duration,
      });

      const newOfficeHours: OfficeHours = {
        _id: response.officeHours,
        classId,
        startTime,
        duration,
      };

      officeHours.value.push(newOfficeHours);
      return response;
    } catch (err: any) {
      error.value = err.response?.data?.error || "Failed to add office hours";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function loadBrontoBoardsForUser(userId: string) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiService.getBrontoBoardsForUser(userId);
      brontoBoards.value = response;
      return response;
    } catch (err: any) {
      error.value = err.response?.data?.error || "Failed to load BrontoBoards";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function loadClassesForBrontoBoard(brontoBoardId: string) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiService.getClassesForBrontoBoard(brontoBoardId);
      classes.value = response;
      return response;
    } catch (err: any) {
      error.value = err.response?.data?.error || "Failed to load classes";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function loadAssignmentsForClass(classId: string) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiService.getAssignmentsForClass(classId);
      assignments.value = response;
      return response;
    } catch (err: any) {
      error.value = err.response?.data?.error || "Failed to load assignments";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function loadOfficeHoursForClass(classId: string) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiService.getOfficeHoursForClass(classId);
      officeHours.value = response;
      return response;
    } catch (err: any) {
      error.value = err.response?.data?.error || "Failed to load office hours";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteAssignment(assignmentId: string) {
    if (!currentBrontoBoard.value) {
      throw new Error("No BrontoBoard selected");
    }

    isLoading.value = true;
    error.value = null;

    try {
      await apiService.removeWork(currentBrontoBoard.value.owner, assignmentId);

      // Remove from local state
      assignments.value = assignments.value.filter(
        (a) => a._id !== assignmentId
      );

      return true;
    } catch (err: any) {
      error.value = err.response?.data?.error || "Failed to delete assignment";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  function setCurrentBrontoBoard(brontoBoard: BrontoBoard) {
    currentBrontoBoard.value = brontoBoard;
  }

  function clearError() {
    error.value = null;
  }

  function setError(errorMessage: string) {
    error.value = errorMessage;
  }

  function setSuccess(successMessage: string) {
    success.value = successMessage;
  }

  function clearSuccess() {
    success.value = null;
  }

  function reset() {
    brontoBoards.value = [];
    currentBrontoBoard.value = null;
    classes.value = [];
    assignments.value = [];
    officeHours.value = [];
    isLoading.value = false;
    error.value = null;
    success.value = null;
  }

  return {
    // State
    brontoBoards,
    currentBrontoBoard,
    classes,
    assignments,
    officeHours,
    isLoading,
    error,
    success,
    // Getters
    currentClasses,
    currentAssignments,
    currentOfficeHours,
    // Actions
    initializeBrontoBoard,
    createClass,
    addAssignment,
    addOfficeHours,
    loadBrontoBoardsForUser,
    loadClassesForBrontoBoard,
    loadAssignmentsForClass,
    loadOfficeHoursForClass,
    deleteAssignment,
    setCurrentBrontoBoard,
    clearError,
    setError,
    setSuccess,
    clearSuccess,
    reset,
  };
});
