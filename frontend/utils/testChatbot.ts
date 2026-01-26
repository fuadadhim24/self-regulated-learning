import { triggerChatbotCardMovement } from "./api";

export async function testChatbotCardMovement() {
  try {
    console.log("Testing chatbot card movement...");

    // Test with dummy data
    const result = await triggerChatbotCardMovement(
      "test_board_id",
      "test_card_id",
      "test_from_column",
      "test_to_column"
    );

    console.log("Chatbot card movement test result:", result);
    return result;
  } catch (error) {
    console.error("Error testing chatbot card movement:", error);
    throw error;
  }
}
