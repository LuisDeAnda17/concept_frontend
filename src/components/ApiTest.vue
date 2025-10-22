<template>
  <div class="api-test">
    <h3>API Connection Test</h3>
    <button
      @click="testApiConnection"
      :disabled="isLoading"
      class="btn btn-primary"
    >
      {{ isLoading ? "Testing..." : "Test API Connection" }}
    </button>
    <div v-if="result" class="result">
      <h4>Result:</h4>
      <pre>{{ JSON.stringify(result, null, 2) }}</pre>
    </div>
    <div v-if="error" class="error">
      <h4>Error:</h4>
      <p>{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { apiService } from "../services/api";

const isLoading = ref(false);
const result = ref<any>(null);
const error = ref("");

async function testApiConnection() {
  isLoading.value = true;
  error.value = "";
  result.value = null;

  try {
    // Test with a simple registration to see if the API is reachable
    const response = await apiService.register("testuser", "testpass");
    result.value = response;
  } catch (err: any) {
    error.value = err.message || "API connection failed";
    console.error("API Test Error:", err);
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.api-test {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin: 20px 0;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.result,
.error {
  margin-top: 15px;
  padding: 10px;
  border-radius: 4px;
}

.result {
  background: #f0f8ff;
  border: 1px solid #b3d9ff;
}

.error {
  background: #fee;
  border: 1px solid #fcc;
  color: #c33;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
