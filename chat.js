// ==================================================
// FULL CORRECT WORKING CHATBOT CODE
// Gemini AI Integration
// Save this file as: chat.js
// ==================================================

// ✅ Paste your Gemini API key only inside these quotes
const GEMINI_API_KEY = "AIzaSyCIQaRxCGHql-XIckglIsX3f5zZAvBxWKE";

// ✅ Model name
const GEMINI_MODEL = "gemini-2.5-flash";

// ==================================================
// Select HTML Elements
// ==================================================

const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector("#close-chatSom");
const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageBtn = document.querySelector("#send-message");
const fileUploadBtn = document.querySelector("#file-upload");
const fileInput = document.querySelector("#file-input");

// ==================================================
// Open / Close Chatbot
// ==================================================

if (chatbotToggler) {
  chatbotToggler.addEventListener("click", function () {
    document.body.classList.toggle("show-chatbot");

    setTimeout(function () {
      if (document.body.classList.contains("show-chatbot") && messageInput) {
        messageInput.focus();
      }
    }, 200);
  });
}

if (closeChatbot) {
  closeChatbot.addEventListener("click", function () {
    document.body.classList.remove("show-chatbot");
  });
}

// ==================================================
// Safety: Escape HTML
// ==================================================

function escapeHTML(text) {
  const div = document.createElement("div");
  div.innerText = text;
  return div.innerHTML;
}

// ==================================================
// Auto Scroll
// ==================================================

function scrollToBottom() {
  if (chatBody) {
    chatBody.scrollTop = chatBody.scrollHeight;
  }
}

// ==================================================
// Add User Message
// ==================================================

function addUserMessage(message) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", "user-message");

  messageDiv.innerHTML =
    '<div class="message-text">' + escapeHTML(message) + "</div>";

  chatBody.appendChild(messageDiv);
  scrollToBottom();
}

// ==================================================
// Add Bot Message
// ==================================================

function addBotMessage(message) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", "bot-message");

  messageDiv.innerHTML =
    '<div class="bot-avatar">AI</div>' +
    '<div class="message-text">' +
    escapeHTML(message) +
    "</div>";

  chatBody.appendChild(messageDiv);
  scrollToBottom();
}

// ==================================================
// Typing Indicator
// ==================================================

function showTypingIndicator() {
  const typingDiv = document.createElement("div");
  typingDiv.classList.add("message", "bot-message", "typing-message");

  typingDiv.innerHTML =
    '<div class="bot-avatar">AI</div>' +
    '<div class="message-text">Typing...</div>';

  chatBody.appendChild(typingDiv);
  scrollToBottom();

  return typingDiv;
}

// ==================================================
// Gemini API Call
// ==================================================

async function callGeminiText(userMessage) {
  if (
    !GEMINI_API_KEY ||
    GEMINI_API_KEY.trim() === "" ||
    GEMINI_API_KEY === "PASTE_YOUR_API_KEY_HERE"
  ) {
    return "API key missing. Paste your Gemini API key inside chat.js.";
  }

  const API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/" +
    GEMINI_MODEL +
    ":generateContent?key=" +
    GEMINI_API_KEY;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text:
              "You are an AI Study Assistant for students. " +
              "Answer simply and clearly. " +
              "Help with DBMS, OOPM, Operating System, Data Structures, Java, programming, projects, and interviews.\n\n" +
              "User question: " +
              userMessage
          }
        ]
      }
    ]
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", data);

      if (data.error && data.error.message) {
        return "AI Error: " + data.error.message;
      }

      return "AI error. Check your API key or Gemini API access.";
    }

    const aiText =
      data &&
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0] &&
      data.candidates[0].content.parts[0].text;

    return aiText || "Sorry, I could not generate a response.";
  } catch (error) {
    console.error("Network Error:", error);
    return "Network error. Check your internet connection.";
  }
}

// ==================================================
// Send Message
// ==================================================

async function handleSendMessage() {
  if (!messageInput || !chatBody) {
    console.error("Chat elements missing in HTML.");
    return;
  }

  const userMessage = messageInput.value.trim();

  if (userMessage === "") {
    return;
  }

  addUserMessage(userMessage);

  messageInput.value = "";
  messageInput.style.height = "42px";

  const typingIndicator = showTypingIndicator();

  try {
    const aiReply = await callGeminiText(userMessage);

    if (typingIndicator) {
      typingIndicator.remove();
    }

    addBotMessage(aiReply);
  } catch (error) {
    console.error("Chatbot Error:", error);

    if (typingIndicator) {
      typingIndicator.remove();
    }

    addBotMessage("Something went wrong. Please check your API key or internet connection.");
  }
}

// ==================================================
// Send Button Click
// ==================================================

if (sendMessageBtn) {
  sendMessageBtn.addEventListener("click", function () {
    handleSendMessage();
  });
}

// ==================================================
// Enter Key Send
// Shift + Enter = New Line
// ==================================================

if (messageInput) {
  messageInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  });

  messageInput.addEventListener("input", function () {
    messageInput.style.height = "42px";
    messageInput.style.height = Math.min(messageInput.scrollHeight, 110) + "px";
  });
}

// ==================================================
// File Upload Preview: Image / Video
// ==================================================

if (fileUploadBtn && fileInput) {
  fileUploadBtn.addEventListener("click", function () {
    fileInput.click();
  });

  fileInput.addEventListener("change", function () {
    const file = fileInput.files[0];

    if (!file) {
      return;
    }

    const fileURL = URL.createObjectURL(file);

    const fileMessageDiv = document.createElement("div");
    fileMessageDiv.classList.add("message", "user-message");

    if (file.type.startsWith("image/")) {
      fileMessageDiv.innerHTML =
        '<div class="message-text file-message">' +
        '<img src="' +
        fileURL +
        '" alt="Uploaded image">' +
        "<p>" +
        escapeHTML(file.name) +
        "</p>" +
        "</div>";
    } else if (file.type.startsWith("video/")) {
      fileMessageDiv.innerHTML =
        '<div class="message-text file-message">' +
        '<video src="' +
        fileURL +
        '" controls></video>' +
        "<p>" +
        escapeHTML(file.name) +
        "</p>" +
        "</div>";
    } else {
      fileMessageDiv.innerHTML =
        '<div class="message-text">Only image and video files are supported.</div>';
    }

    chatBody.appendChild(fileMessageDiv);
    scrollToBottom();

    addBotMessage("File uploaded successfully ✅ This is preview only.");

    fileInput.value = "";
  });
}

// ==================================================
// Loaded Check
// ==================================================

console.log("Chatbot loaded successfully.");