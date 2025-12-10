#!/usr/bin/env node

/**
 * ============================================
 * Notes API Testing Script (Node.js)
 * ============================================
 * This script tests all Notes API endpoints
 * Make sure to set your JWT token first!
 * ============================================
 */

// Configuration
const BASE_URL = "http://localhost:5000/api/v1";
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1YWEzM2RiYi04NjFlLTRjYjMtOTA1YS1kNjgwZmQyZjY0ODIiLCJpYXQiOjE3NjUyNzc0NTYsImV4cCI6MTc2NTg4MjI1Nn0.B0Nlogb1AWuxuG3fzp_J9Hg5YbyXie56QZhHFsDewno"; // <-- PASTE YOUR JWT TOKEN HERE

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

// Helper function to print colored text
function print(text, color = "reset") {
  console.log(`${colors[color]}${text}${colors.reset}`);
}

// Function to print section headers
function printHeader(title) {
  console.log("");
  print("============================================", "blue");
  print(title, "blue");
  print("============================================", "blue");
  console.log("");
}

// Function to make API requests
async function makeRequest(method, endpoint, body = null) {
  const url = `${BASE_URL}/${endpoint}`;
  const options = {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    console.log(`HTTP Status: ${response.status}`);
    console.log("Response:");
    console.log(JSON.stringify(data, null, 2));

    return {
      status: response.status,
      data,
      success: response.ok,
    };
  } catch (error) {
    print(`✗ Request failed: ${error.message}`, "red");
    return {
      status: 0,
      data: null,
      success: false,
      error: error.message,
    };
  }
}

// Main testing function
async function runTests() {
  // Check if token is set
  if (!TOKEN || TOKEN === "") {
    print("ERROR: JWT Token not set!", "red");
    print("Please edit this script and set the TOKEN variable", "yellow");
    process.exit(1);
  }

  // Variables to store created IDs
  let standaloneNoteId = "";
  let articleNoteId = "";
  const articleSlug = "quantum-computing-basics";

  // ============================================
  // TEST 1: Create Standalone Note
  // ============================================
  printHeader("TEST 1: Create Standalone Note");

  print("Creating standalone note with title and content...");
  let result = await makeRequest("POST", "notes", {
    title: "My Test Standalone Note",
    content: "This is a test standalone note created from Node.js script",
  });

  if (result.success && result.data.data) {
    standaloneNoteId = result.data.data.id;
    print("✓ Standalone note created successfully", "green");
    print(`Note ID: ${standaloneNoteId}`, "cyan");
  } else {
    print("✗ Failed to create standalone note", "red");
  }

  // ============================================
  // TEST 2: Create Article Note
  // ============================================
  printHeader("TEST 2: Create Article Note");

  print("Creating article note (linked to article)...");
  result = await makeRequest("POST", "notes", {
    content:
      "Great insights about quantum computing! This is my personal note.",
    articleSlug: articleSlug,
  });

  if (result.success && result.data.data) {
    articleNoteId = result.data.data.id;
    print("✓ Article note created successfully", "green");
    print(`Note ID: ${articleNoteId}`, "cyan");
  } else {
    print("✗ Failed to create article note", "red");
  }

  // ============================================
  // TEST 3: Get All Notes
  // ============================================
  printHeader("TEST 3: Get All Notes");

  print("Fetching all user notes...");
  result = await makeRequest("GET", "notes");

  if (result.success && result.data.data) {
    const noteCount = result.data.data.length;
    print(`✓ Retrieved ${noteCount} notes`, "green");
  } else {
    print("✗ Failed to get notes", "red");
  }

  // ============================================
  // TEST 4: Get Standalone Notes Only
  // ============================================
  printHeader("TEST 4: Get Standalone Notes Only");

  print("Fetching standalone notes only...");
  result = await makeRequest("GET", "notes?standalone=true");

  if (result.success && result.data.data) {
    const noteCount = result.data.data.length;
    print(`✓ Retrieved ${noteCount} standalone notes`, "green");
  } else {
    print("✗ Failed to get standalone notes", "red");
  }

  // ============================================
  // TEST 5: Get Notes by Article Slug
  // ============================================
  printHeader("TEST 5: Get Notes by Article Slug");

  print(`Fetching notes for article: ${articleSlug}...`);
  result = await makeRequest("GET", `notes?articleSlug=${articleSlug}`);

  if (result.success && result.data.data) {
    const noteCount = result.data.data.length;
    print(`✓ Retrieved ${noteCount} notes for article`, "green");
  } else {
    print("✗ Failed to get article notes", "red");
  }

  // ============================================
  // TEST 6: Get Single Note by ID
  // ============================================
  printHeader("TEST 6: Get Single Note by ID");

  if (standaloneNoteId) {
    print(`Fetching standalone note by ID: ${standaloneNoteId}...`);
    result = await makeRequest("GET", `notes/${standaloneNoteId}`);

    if (result.success && result.data.data) {
      print("✓ Retrieved note successfully", "green");
    } else {
      print("✗ Failed to get note", "red");
    }
  } else {
    print("⚠ Skipping - No standalone note ID available", "yellow");
  }

  // ============================================
  // TEST 7: Update Standalone Note
  // ============================================
  printHeader("TEST 7: Update Standalone Note");

  if (standaloneNoteId) {
    print("Updating standalone note...");
    result = await makeRequest("PUT", `notes/${standaloneNoteId}`, {
      title: "Updated Test Note",
      content: "This content has been updated via Node.js script",
    });

    if (result.success && result.data.data) {
      print("✓ Note updated successfully", "green");
    } else {
      print("✗ Failed to update note", "red");
    }
  } else {
    print("⚠ Skipping - No standalone note ID available", "yellow");
  }

  // ============================================
  // TEST 8: Update Article Note (Content Only)
  // ============================================
  printHeader("TEST 8: Update Article Note (Content Only)");

  if (articleNoteId) {
    print("Updating article note content...");
    result = await makeRequest("PUT", `notes/${articleNoteId}`, {
      content: "Updated insights about quantum computing!",
    });

    if (result.success && result.data.data) {
      print("✓ Article note updated successfully", "green");
    } else {
      print("✗ Failed to update article note", "red");
    }
  } else {
    print("⚠ Skipping - No article note ID available", "yellow");
  }

  // ============================================
  // TEST 9: Delete Article Note
  // ============================================
  printHeader("TEST 9: Delete Article Note");

  if (articleNoteId) {
    print("Deleting article note...");
    result = await makeRequest("DELETE", `notes/${articleNoteId}`);

    if (result.success) {
      print("✓ Article note deleted successfully", "green");
    } else {
      print("✗ Failed to delete article note", "red");
    }
  } else {
    print("⚠ Skipping - No article note ID available", "yellow");
  }

  // ============================================
  // TEST 10: Verify Deletion
  // ============================================
  printHeader("TEST 10: Verify Deletion");

  if (articleNoteId) {
    print("Attempting to fetch deleted note...");
    result = await makeRequest("GET", `notes/${articleNoteId}`);

    if (result.status === 404) {
      print("✓ Note successfully deleted (404 as expected)", "green");
    } else {
      print("✗ Note still exists (should be 404)", "red");
    }
  } else {
    print("⚠ Skipping - No article note ID available", "yellow");
  }

  // ============================================
  // TEST 11: Delete Standalone Note (Cleanup)
  // ============================================
  printHeader("TEST 11: Delete Standalone Note (Cleanup)");

  if (standaloneNoteId) {
    print("Deleting standalone note for cleanup...");
    result = await makeRequest("DELETE", `notes/${standaloneNoteId}`);

    if (result.success) {
      print("✓ Standalone note deleted successfully", "green");
    } else {
      print("✗ Failed to delete standalone note", "red");
    }
  } else {
    print("⚠ Skipping - No standalone note ID available", "yellow");
  }

  // ============================================
  // SUMMARY
  // ============================================
  printHeader("TESTING COMPLETE");
  print("All tests have been executed!", "green");
  console.log("");
  console.log("Next steps:");
  console.log("1. Review the test results above");
  console.log("2. If all tests passed, the API is ready for frontend integration");
  console.log("3. If any tests failed, check the backend logs for details");
  console.log("");
}

// Run the tests
runTests().catch((error) => {
  print(`Fatal error: ${error.message}`, "red");
  process.exit(1);
});
