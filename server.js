const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --- SIMPLE IN-MEMORY CHAT HISTORY ---
let chatHistory = [];

const SYSTEM_CONTEXT = `
You are a chatbot on a college student's personal portfolio website.

Student details:
- Degree: Bachelor's student
- Learning web development
- Skills: HTML, CSS, JavaScript, basic React, basic Node.js
- Projects:
  1) HTML Only Page – first HTML assignment
  2) Calculator App – basic calculator with some bugs
  3) Weather Widget – React app using an API

Personality:
- Friendly
- Honest
- Beginner but confident
- Casual, human tone

Rules:
- Answer clearly and directly
- If asked about projects, list them
- If asked about studies, mention bachelor's degree
- Do NOT repeat "I am a beginner" unless relevant
- Keep answers short and natural
`;

app.get('/', (req, res) => {
  res.send("Server is running okay.");
});

app.get('/api/projects', (req, res) => {
  res.json([
    { id: 1, title: "HTML Only Page", tech: "HTML" },
    { id: 2, title: "Calculator App", tech: "JavaScript" },
    { id: 3, title: "Weather Widget", tech: "React" }
  ]);
});

app.post('/api/chat', async (req, res) => {
  try {
    const userMsg = req.body.message;

    // Add user message to history
    chatHistory.push({
      role: "user",
      parts: [{ text: userMsg }]
    });

    // Keep only last 6 messages (to avoid token issues)
    chatHistory = chatHistory.slice(-6);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: SYSTEM_CONTEXT }] },
            ...chatHistory
          ]
        })
      }
    );

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn’t think of a good answer 😅";

    // Add bot reply to history
    chatHistory.push({
      role: "model",
      parts: [{ text: reply }]
    });

    res.json({ reply });

  } catch (err) {
    console.error("CHAT ERROR:", err);
    res.json({ reply: "Something went wrong. Please try again." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
