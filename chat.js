// ==================================================
// FULL CORRECT WORKING CHATBOT CODE
// Frontend calls Vercel Serverless Function
// Save this file as: chat.js
// ==================================================

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

// Top Ask AI Elements
const topAIInput = document.querySelector("#top-ai-input");
const topAIBtn = document.querySelector("#top-ai-btn");

// ==================================================
// Call Serverless API
// ==================================================

async function getAIReply(userMessage) {
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: userMessage
      })
    });

    const text = await response.text();

    if (!text) {
      return "AI Error: Empty response from server.";
    }

    let data;

    try {
      data = JSON.parse(text);
    } catch (error) {
      return "AI Error: Server did not return JSON.";
    }

    if (data.reply) {
      return data.reply;
    }

    return "AI Error: " + (data.details || data.error || "Something went wrong");
  } catch (error) {
    return "AI Error: " + error.message;
  }
}

// ==================================================
// Open / Close Chatbot
// ==================================================

function openChatbot() {
  document.body.classList.add("show-chatbot");

  setTimeout(function () {
    if (messageInput) {
      messageInput.focus();
    }
  }, 200);
}

function closeChatbotPopup() {
  document.body.classList.remove("show-chatbot");
}

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
  closeChatbot.addEventListener("click", closeChatbotPopup);
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
// Ask AI Common Function
// ==================================================

async function askAI(userMessage) {
  if (!chatBody) {
    console.error("Chat body missing in HTML.");
    return;
  }

  openChatbot();

  addUserMessage(userMessage);

  const typingIndicator = showTypingIndicator();

  try {
    const aiReply = await getAIReply(userMessage);

    if (typingIndicator) {
      typingIndicator.remove();
    }

    addBotMessage(aiReply);
  } catch (error) {
    console.error("Chatbot Error:", error);

    if (typingIndicator) {
      typingIndicator.remove();
    }

    addBotMessage("Something went wrong. Please try again.");
  }
}

// ==================================================
// Send Message From Chatbot
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

  messageInput.value = "";
  messageInput.style.height = "42px";

  await askAI(userMessage);
}

// ==================================================
// Send Message From Top Ask AI Bar
// ==================================================

async function handleTopAIAsk() {
  if (!topAIInput || !messageInput) {
    return;
  }

  const userMessage = topAIInput.value.trim();

  if (userMessage === "") {
    return;
  }

  // Open chatbot
  openChatbot();

  // Paste navbar question into chatbot textarea
  messageInput.value = userMessage;

  // Clear navbar input
  topAIInput.value = "";

  // Adjust textarea height
  messageInput.style.height = "42px";
  messageInput.style.height = Math.min(messageInput.scrollHeight, 110) + "px";

  // Focus chatbot input
  messageInput.focus();

  // Automatically send message to AI
  await handleSendMessage();
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
// Top Ask AI Button Click
// ==================================================

if (topAIBtn) {
  topAIBtn.addEventListener("click", function () {
    handleTopAIAsk();
  });
}

// ==================================================
// Enter Key Send in Chatbot
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
// Enter Key Send in Top Ask AI Bar
// ==================================================

if (topAIInput) {
  topAIInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleTopAIAsk();
    }
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