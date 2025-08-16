// ====== ELEMENT REFERENCES ======
// Get references to the input box and chat display box from HTML
const inputBox = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

// Array to store chatbot intents loaded from a JSON file
let intentsData = [];

// Default fallback response if no match is found
let fallbackResponse = "🤖 I'm sorry, I didn't quite get that. Could you please rephrase your question? You can ask about: 👉 Course registration (Fall, Spring, Summer) 👉 Class schedules 👉 IT support 👉 Password reset 👉 Library services and more.";

// ====== BUTTON-TO-INTENT MAPPING ======
// Map specific button text to specific intent names
// This helps when the user clicks a quick-action button instead of typing
const buttonIntentMap = {
  "login help": "UC_Intent_LoginHelp",
  "front desk help": "UC_Intent_ITSupport",
  "library help": "UC_Intent_GetLibraryInfo",
  "registration help": "registration" // This will match any intent containing "registration"
};

// ====== LOAD CHATBOT INTENTS FROM JSON FILE ======
// Fetch the JSON file containing all intents and utterances
fetch("UC_Lex_All_Chatbot_Intents.json")
  .then(res => res.json())
  .then(data => {
    intentsData = data; // Store the intents
    // Find the fallback intent and store its response
    const fallbackIntent = intentsData.find(i => i.intentName === "FallbackIntent");
    if (fallbackIntent) fallbackResponse = fallbackIntent.closingResponse;
  });

// ====== HELPER FUNCTIONS ======

// Sets an example message into the input box and sends it automatically
function setExample(message) {
  inputBox.value = message;
  sendMessage();
}

// Sends the user’s message and gets a bot response
function sendMessage() {
  const userInput = inputBox.value.trim(); // Remove extra spaces
  if (!userInput) return; // Do nothing if input is empty

  // Add user's message to the chat
  addMessage(userInput, "user-message");

  // Clear the input box
  inputBox.value = "";

  // Get bot's response
  const response = getBotResponse(userInput);

  // Show bot's response after a short delay (for realism)
  setTimeout(() => addMessage(response, "bot-message"), 600);
}

// Determines the bot's response based on user input
function getBotResponse(userInput) {
  const lowerInput = userInput.toLowerCase(); // Convert to lowercase for matching
  let matchedIntent = null;

  // 1️⃣ Check if the input exactly matches one of the quick-action button mappings
  if (buttonIntentMap[lowerInput]) {
    const mapped = buttonIntentMap[lowerInput];

    // Special case: If the mapped intent is "registration", find any intent containing the word "registration"
    if (mapped === "registration") {
      matchedIntent = intentsData.find(i => i.intentName.toLowerCase().includes("registration"));
    } else {
      matchedIntent = intentsData.find(i => i.intentName === mapped);
    }

    // Return the closing response if found, otherwise return fallback
    return matchedIntent ? matchedIntent.closingResponse : fallbackResponse;
  }

  // 2️⃣ Otherwise, do partial matching with the sample utterances in each intent
  for (const intent of intentsData) {
    if (intent.intentName === "FallbackIntent") continue; // Skip fallback intent

    for (const utterance of intent.sampleUtterances) {
      const lowerUtt = utterance.toLowerCase();
      // Check if user input contains the utterance OR the utterance contains the user input
      if (lowerInput.includes(lowerUtt) || lowerUtt.includes(lowerInput)) {
        matchedIntent = intent;
        break;
      }
    }
    if (matchedIntent) break; // Stop searching if a match is found
  }

  // Return the matched intent's closing response or the fallback response
  return matchedIntent ? matchedIntent.closingResponse : fallbackResponse;
}

// Adds a message bubble to the chat window
function addMessage(message, className) {
  const msgDiv = document.createElement("div");
  msgDiv.className = className; // "user-message" or "bot-message"
  msgDiv.innerHTML = message; // Allow HTML formatting (e.g., line breaks)
  chatBox.appendChild(msgDiv); // Add message to the chat
  chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the latest message
}

// Clears the chat and resets it to the welcome message
function clearChat() {
  chatBox.innerHTML = `<div class="bot-message">
    This is a simple chatbot for student help. You can ask your queries here.<br/>
    How can I help you?
  </div>`;
}

// ====== EVENT LISTENERS ======
// Allow pressing "Enter" to send the message instead of clicking the send button
inputBox.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    sendMessage();
  }
});
