const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

let chatHistory = [];

const BOT_CONTEXT = `
You are a friendly chatbot on a college student's personal portfolio website.

Student profile:
- Pursuing a Bachelor's degree
- Learning web development
- Skills: HTML, CSS, JavaScript, basic React, basic Node.js
- Projects:
  1) HTML Only Page – first HTML assignment
  2) Calculator App – simple calculator with some bugs
  3) Weather Widget – React app using an API

Behavior rules:
- Talk like a real human
- Do not repeat the same sentence
- Do not keep saying "I am a beginner"
- Mention beginner status only if asked about skills or experience
- Be conversational and casual
- Respond differently to follow-up questions
- Keep replies short and natural
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

    chatHistory.push({
      role: "user",
      parts: [{ text: userMsg }]
    });

    chatHistory = chatHistory.slice(-8);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generationConfig: {
            temperature: 0.9,
            topP: 0.95,
            maxOutputTokens: 180
          },
          contents: [
            {
              role: "user",
              parts: [{ text: BOT_CONTEXT }]
            },
            ...chatHistory
          ]
        })
      }
    );

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Hmm… give me a second to think 😅";

    chatHistory.push({
      role: "model",
      parts: [{ text: reply }]
    });

    res.json({ reply });

  } catch (err) {
    res.json({ reply: "Something went wrong. Please try again." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
