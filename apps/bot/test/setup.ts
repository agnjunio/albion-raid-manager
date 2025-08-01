import { config } from "dotenv";
import { afterAll, afterEach, beforeAll } from "vitest";

// Load environment variables for testing
config({ path: ".env.test" });

// Global test setup
beforeAll(async () => {
  // Setup any global test configuration
  console.log("Setting up test environment...");
});

// Global test cleanup
afterAll(async () => {
  // Cleanup any global test resources
  console.log("Cleaning up test environment...");
});

// Clean up after each test
afterEach(async () => {
  // Reset any test state
});
