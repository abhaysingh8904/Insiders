const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileCancelButton = document.querySelector("#file-cancel");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector("#close-chatSom");




//API Setup
const API_KEY = "AIzaSyCr5O-meLkoJqzoTW5DlwSC_jytYSk-kKE";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?
key=${API_KEY}`;

const userData = {
    message: null,
    message:null,
    file:{
        data: null,
        mime_type: null
    }
}

const chatHistory = [];
const initialInputHeight = messageInput.scrollHeight;

// create message element with dynamic classes and return it
const createMessageElement = (content , ...classes) =>{
const div = document.createElement("div");
div.classList.add("message" , ...classes);
div.innerHTML = content;
return div;
}

// Generate Bot Response using API
const generateBotResponse =async (incomingMessageDiv) =>{
    const messageElement = incomingMessageDiv.querySelector(".message-text");

      //Add user message to chat history
    chatHistory.push({
        role: "user",
        parts: [{text: userData.message}, ...(userData.file.data ? [{inline_data: userData.file}] :
             [])]
      });

    // API Request options
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type" : "application/json " },
        body: JSON.stringify({
            contents: chatHistory
        })
    }

try{
    //Fetch bot response from API
const response = await fetch(API_URL , requestOptions);
const data = await response.json();
if(!response.ok) throw new Error(data.error.message)
    //Extract and display bots response text
    const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
    messageElement.innerText = apiResponseText;

    //Add bot response to chat history
     chatHistory.push({
        role: "model",
        parts: [{text: userData.message}]
     });
}catch(error){
    //handle error in API response
console.log(error);
messageElement.innerText = error.message;
messageElement.style.color = "#ff0000";
} finally {
    // Reset user's file daata , removing thinking indicator and scroll chat to bottom
    userData.file = {};
    incomingMessageDiv.classList.remove("thinking");
    chatBody.scrollTo({top: chatBody.scrollHeight , behavior: "smooth"});
}
}

// Handle outgoing user messages
const handleOutgoingMessage = (e) => {
    e.preventDefault();
userData.message = messageInput.value.trim();
messageInput.value = "";
fileUploadWrapper.classList.remove("file-uploaded");
messageInput.dispatchEvent(new Event("input"));

    // Creae and display user message
const  messageContent = `<div class="message-text"></div>
                         ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,
                         ${userData. file.data}" class = "attachment" />` : ""}`;
                         

const outgoingMessageDiv = createMessageElement(messageContent , "user-message");
outgoingMessageDiv.querySelector(".message-text"). textContent = userData.message;
chatBody.appendChild(outgoingMessageDiv);
chatBody.scrollTo({top: chatBody.scrollHeight , behavior: "smooth"});

// simulate bot response with thinking indicator after a delayy
setTimeout(() => {
const  messageContent = `     <svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
    <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"></path>
</svg>
            <div class="message-text">
                <div class="thinking-indicator">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>` ;

const incomingMessageDiv = createMessageElement(messageContent , "bot-message","thinking");
chatBody.appendChild(incomingMessageDiv);
chatBody.scrollTo({top: chatBody.scrollHeight , behavior: "smooth"});
generateBotResponse(incomingMessageDiv);
},600);
}

// Handle Enter key press for Sending message
messageInput.addEventListener("keydown" , (e)=>{
const userMessage = e.target.value.trim();
if(e.key === "Enter" && userMessage && !e.shiftkey && window.innerWidth > 768) {
    handleOutgoingMessage(e);
}
});

// Adjust input field height dynamically
messageInput.addEventListener("input" , () => {
messageInput.style.height = `${initialInputHeight}px`;
messageInput.style.height = `${messageInput.scrollHeight}px`;
document.querySelector(".chat-form").style.borderRadius = messageInput.scrollHeight > 
 initialInputHeight ? "15px" : "32px";
});

//Handle file input change and preview the selected file
fileInput.addEventListener("change", ()=>{
    const file = fileInput.files[0];
    if(!file) return;

const reader = new FileReader();
reader.onload = (e)=> {
    fileUploadWrapper.querySelector("img").src = e.target.result;
    fileUploadWrapper.classList.add("file-uploaded");
const base64String = e.target.result.split(",")[1];

//Store file data in userData
    userData.file={
        data: base64String,
        mime_type: file.type
    }

    fileInput.value = "";
}
reader.readAsDataURL(file)
})
// Cancel file upload
fileCancelButton.addEventListener("click", ()=>{
    userData.file = {};
    fileUploadWrapper.classList.remove("file-uploaded");
});
// initialize emoji picker and handle emoji selection
const picker = new EmojiMart.Picker({
    theme: "light",
    skintonePosition: "none",
    previewPosition: "none",
    onEmojiSelect: (emoji) => {
    const {selectionStart: start, selectionEnd : end} = messageInput;
     messageInput.setRangeText(emoji.native, start, end, "end");
    messageInput.focus();
    },
    onClickOutside: (e) => {
        if(e.target.id === "emoji-picker"){
            document.body.classList.toggle("show-emoji-picker");
    } else {
         document.body.classList.remove("show-emoji-picker");
    }
}
})

document.querySelector(".chat-form").appendChild(picker);

sendMessageButton.addEventListener("click" , (e) => handleOutgoingMessage(e));
document.querySelector("#file-upload").addEventListener("click" , ()=> fileInput.click());
chatbotToggler.addEventListener("click" , () => document.body.classList.toggle("show-chatbot"));
closeChatbot.addEventListener("click" , () =>document.body.classList.remove("show-chatbot"));// const signupbutton= document.getelementbyid('SIGNUPbutton')
// const signinbutton= documenT.getelementbyid('SIGNINBUTTON')
// const signinform=document.getelementbyid('SIGNIN')
// const SIGNUPFORM=document.getelementbyid('SIGNUP_CONTAINER')
// const icon=document.getelementbyid('icon')
// iconbutton.addEventlistener
// signupbutton.addEventlistener('click',function(){
//   signinform.style.display="none";
//   SIGNUPFORM.style.display="block";
// })
// signinbutton.addEventlistener('click',function(){
//   signinform.style.display="block";
//   SIGNUPFORM.style.display="none";
// })





































// import { GoogleGenAI } from "@google/genai";
// import express from 'express';
// // The client gets the API key from the environment variable `GEMINI_API_KEY`.
// const API_key = "AIzaSyCr5O-meLkoJqzoTW5DlwSC_jytYSk-kKE";
// const ai = new GoogleGenAI({apiKey:API_key});

// async function main() {
//   const response = await ai.models.generateContent({
//     model: "gemini-2.5-flash-lite", 
//     contents: "ITM university gwalior",
//   });
//   console.log(response.text);
// }

// main();


// import { GoogleGenerativeAI } from "@google/generative-ai";

// const API_key = "AIzaSyCr5O-meLkoJqzoTW5DlwSC_jytYSk-kKE";  // ← यहाँ अपनी Gemini API Key डालो
// const ai = new GoogleGenerativeAI({apiKey:API_key});

// const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

// window.askGemini = async function () {
//   const question = document.getElementById("userInput").value;

//   const result = await model.generateContent(question);
//   const answer = result.response.text();

//   document.getElementById("response").innerText = answer;
// };















// import { GoogleGenAI } from "@google/genai";
// import express from 'express';

// const API_KEY = "AIzaSyCR50-meikojqzoTWSdLWSc_JjTYSk-KKE"; 
// const ai = new GoogleGenAI(API_KEY);
// const model = "gemini-2.5-flash-lite";

// const app = express();
// const port = 3000;

// app.use(express.json());

// app.post('/api/generate', async (req, res) => {
//     const userPrompt = req.body.prompt; 

//     if (!userPrompt) {
//         return res.status(400).json({ error: "Please provide a 'prompt' in the request body." });
//     }

//     try {
//         const response = await ai.models.generateContent({
//             model: model,
//             contents: userPrompt,
//         });

//         res.json({ 
//             prompt: userPrompt,
//             aiResponse: response.text
//         });
        
//     } catch (error) {
//         console.error("Gemini API Error:", error);
//         res.status(500).json({ error: "Failed to generate content from AI." });
//     }
// });

// app.listen(port, () => {
//     console.log(`🚀 Server running at http://localhost:${port}`);
//     console.log(`API endpoint: POST http://localhost:${port}/api/generate`);
// });


















































































































// // 1. Get references to the form and the message display area
// const registrationForm = document.getElementById('registrerForm');
// const messageDisplay = document.getElementById('message');

// // *CRITICAL:* Replace this with the actual URL of your back-end API registration route.
// // Example: http://localhost:3000/register or https://api.yourwebsite.com/users
// const API_URL = 'YOUR_BACKEND_API_REGISTER_URL';

// // 2. Add an event listener to handle form submission
// registrationForm.addEventListener('submit', async (event) => {
//     // Prevent the default HTML form submission which would cause a page reload
//     event.preventDefault(); 
    
//     // Clear previous messages
//     messageDisplay.textContent = 'Registering...';
//     messageDisplay.style.color = 'blue';

//     // 3. Collect form data
//     const username = document.getElementById('email').value;
//     const email = document.getElementById('password').value;
//     const password = document.getElementById('retype').value;

//     // 4. Structure the data as a JavaScript object (which will become JSON)
//     const userData = {
//         username: email,
//         email: password,
//         password: retype
//     };

//     try {
//         // 5. Use the fetch API to send a POST request to the back-end
//         const response = await fetch(API_URL, {
//             method: 'POST', // Use the POST method for registration
//             headers: {
//                 // Tells the server the request body is JSON
//                 'Content-Type': 'application/json' 
//             },
//             // Convert the JavaScript object into a JSON string for transmission
//             body: JSON.stringify(userData) 
//         });

//         // 6. Handle the response from the server
//         const responseData = await response.json(); // Get the response body as JSON

//         if (response.ok) { // Status codes 200-299 are generally 'ok'
//             // Registration successful!
//             messageDisplay.textContent = '✅ Registration successful! You can now log in.';
//             messageDisplay.style.color = 'green';
//             registrationForm.reset(); // Optional: Clear the form fields
//         } else {
//             // Server returned an error (e.g., 400 Bad Request, 409 Conflict)
//             const errorMessage = responseData.message || 'Registration failed due to a server error.';
//             messageDisplay.textContent = ❌ Error: ${errorMessage};
//             messageDisplay.style.color = 'red';
//         }

//     } catch (error) {
//         // Handle network errors (e.g., server is down, no internet connection)
//         console.error('Network or CORS error:', error);
//         messageDisplay.textContent = '❌ A network error occurred. Please try again.';
//         messageDisplay.style.color = 'red';
//     }
// });