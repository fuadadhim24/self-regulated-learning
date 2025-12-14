import { triggerChatbotCardMovement } from "./api";

/**
 * Fungsi untuk menguji respons chatbot untuk berbagai skenario perpindahan card
 * Ini akan membantu memvalidasi bahwa sistem prompting yang baru berfungsi dengan baik
 * dengan fokus pada perpindahan card spesifik tanpa merangkum semua data
 */

// Skenario 1: Perpindahan dari Planning ke Monitoring dengan materi critical dan hard
export async function testPlanningToMonitoringCriticalHard() {
  console.log(
    "Testing Planning to Monitoring movement with critical priority and hard difficulty..."
  );

  try {
    const response = await triggerChatbotCardMovement(
      "test-user-id",
      "test-card-id",
      "Planning (To Do)",
      "Monitoring (In Progress)",
      "Object Oriented Programming [CS101]",
      "Classes and Objects",
      "hard",
      "critical",
      "Rehearsal Strategies - Pengulangan Materi",
      30,
      undefined,
      undefined,
      "notification"
    );

    const data = await response.json();
    console.log("Planning to Monitoring (Critical/Hard) response:", data);
    return data;
  } catch (error) {
    console.error(
      "Error testing Planning to Monitoring (Critical/Hard):",
      error
    );
    throw error;
  }
}

// Skenario 2: Perpindahan dari Planning ke Monitoring dengan materi expert dan critical
export async function testPlanningToMonitoringExpertCritical() {
  console.log(
    "Testing Planning to Monitoring movement with expert difficulty and critical priority..."
  );

  try {
    const response = await triggerChatbotCardMovement(
      "test-user-id",
      "test-card-id",
      "Planning (To Do)",
      "Monitoring (In Progress)",
      "Discrete Mathematics [CS142]",
      "Algebra",
      "expert",
      "critical",
      "Elaboration Strategies - Elaborasi Konsep",
      20,
      undefined,
      undefined,
      "notification"
    );

    const data = await response.json();
    console.log("Planning to Monitoring (Expert/Critical) response:", data);
    return data;
  } catch (error) {
    console.error(
      "Error testing Planning to Monitoring (Expert/Critical):",
      error
    );
    throw error;
  }
}

// Skenario 3: Perpindahan dari Monitoring ke Controlling dengan pre-test sedang
export async function testMonitoringToControllingMediumPreTest() {
  console.log(
    "Testing Monitoring to Controlling movement with medium pre-test grade..."
  );

  try {
    const response = await triggerChatbotCardMovement(
      "test-user-id",
      "test-card-id",
      "Monitoring (In Progress)",
      "Controlling (Review)",
      "Discrete Mathematics [CS142]",
      "Algebra",
      "easy",
      "medium",
      "Elaboration Strategies - Elaborasi Konsep",
      50,
      undefined,
      undefined,
      "notification"
    );

    const data = await response.json();
    console.log("Monitoring to Controlling (Medium Pre-test) response:", data);
    return data;
  } catch (error) {
    console.error(
      "Error testing Monitoring to Controlling (Medium Pre-test):",
      error
    );
    throw error;
  }
}

// Skenario 4: Perpindahan dari Controlling ke Reflection tanpa post-test
export async function testControllingToReflectionNoPostTest() {
  console.log(
    "Testing Controlling to Reflection movement without post-test grade..."
  );

  try {
    const response = await triggerChatbotCardMovement(
      "test-user-id",
      "test-card-id",
      "Controlling (Review)",
      "Reflection (Done)",
      "Linear Algebra [CS102]",
      "Vectors and Vector Operations",
      "easy",
      "medium",
      "Organizational Strategies - Organisasi Materi",
      undefined,
      undefined,
      undefined,
      "notification"
    );

    const data = await response.json();
    console.log("Controlling to Reflection (No Post-test) response:", data);
    return data;
  } catch (error) {
    console.error(
      "Error testing Controlling to Reflection (No Post-test):",
      error
    );
    throw error;
  }
}

// Skenario 5: Perpindahan dari Controlling ke Reflection dengan post-test rendah
export async function testControllingToReflectionLowPostTest() {
  console.log(
    "Testing Controlling to Reflection movement with low post-test grade..."
  );

  try {
    const response = await triggerChatbotCardMovement(
      "test-user-id",
      "test-card-id",
      "Controlling (Review)",
      "Reflection (Done)",
      "Linear Algebra [CS102]",
      "Linear Transformation",
      "easy",
      "medium",
      "Organizational Strategies - Organisasi Materi",
      40,
      50,
      undefined,
      "notification"
    );

    const data = await response.json();
    console.log("Controlling to Reflection (Low Post-test) response:", data);
    return data;
  } catch (error) {
    console.error(
      "Error testing Controlling to Reflection (Low Post-test):",
      error
    );
    throw error;
  }
}

// Skenario 6: Perpindahan dari Controlling ke Reflection tanpa nilai test tapi dengan rating
export async function testControllingToReflectionWithRating() {
  console.log(
    "Testing Controlling to Reflection movement with rating but no test grades..."
  );

  try {
    const response = await triggerChatbotCardMovement(
      "test-user-id",
      "test-card-id",
      "Controlling (Review)",
      "Reflection (Done)",
      "Object Oriented Programming [CS101]",
      "Topic A",
      "easy",
      "medium",
      "Rehearsal Strategies - Pengulangan Materi",
      undefined,
      undefined,
      3,
      "notification"
    );

    const data = await response.json();
    console.log("Controlling to Reflection (Rating Only) response:", data);
    return data;
  } catch (error) {
    console.error(
      "Error testing Controlling to Reflection (Rating Only):",
      error
    );
    throw error;
  }
}

// Skenario 7: Perpindahan dengan peningkatan signifikan (pre-test ke post-test)
export async function testSignificantImprovement() {
  console.log(
    "Testing movement with significant improvement from pre-test to post-test..."
  );

  try {
    const response = await triggerChatbotCardMovement(
      "test-user-id",
      "test-card-id",
      "Monitoring (In Progress)",
      "Controlling (Review)",
      "Object Oriented Programming [CS101]",
      "Classes and Objects",
      "hard",
      "critical",
      "Rehearsal Strategies - Pengulangan Materi",
      30,
      70,
      undefined,
      "notification"
    );

    const data = await response.json();
    console.log("Significant Improvement response:", data);
    return data;
  } catch (error) {
    console.error("Error testing Significant Improvement:", error);
    throw error;
  }
}

// Skenario 8: Perpindahan dengan peningkatan minimal (pre-test ke post-test)
export async function testMinimalImprovement() {
  console.log(
    "Testing movement with minimal improvement from pre-test to post-test..."
  );

  try {
    const response = await triggerChatbotCardMovement(
      "test-user-id",
      "test-card-id",
      "Monitoring (In Progress)",
      "Controlling (Review)",
      "Discrete Mathematics [CS142]",
      "Algebra",
      "expert",
      "critical",
      "Elaboration Strategies - Elaborasi Konsep",
      20,
      25,
      undefined,
      "notification"
    );

    const data = await response.json();
    console.log("Minimal Improvement response:", data);
    return data;
  } catch (error) {
    console.error("Error testing Minimal Improvement:", error);
    throw error;
  }
}

// Fungsi untuk menjalankan semua tes
export async function runAllTests() {
  console.log("Running all card movement scenario tests...");

  try {
    await testPlanningToMonitoringCriticalHard();
    await testPlanningToMonitoringExpertCritical();
    await testMonitoringToControllingMediumPreTest();
    await testControllingToReflectionNoPostTest();
    await testControllingToReflectionLowPostTest();
    await testControllingToReflectionWithRating();
    await testSignificantImprovement();
    await testMinimalImprovement();

    console.log("All tests completed successfully!");
  } catch (error) {
    console.error("Error running tests:", error);
    throw error;
  }
}
