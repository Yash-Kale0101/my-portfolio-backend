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

About the student:
- Pursuing a Bachelor's degree
- Learning web development
- Skills: HTML, CSS, JavaScript, basic React, basic Node.js
- Projects:
  1. HTML Only Page – first HTML assignment
  2. Calculator App – simple calculator with some bugs
  3. Weather Widget – React app using an API

Personality rules:
- Talk like a real human, not an AI
- Do NOT repeat the same sentence again and again
- Do NOT keep saying "I am a beginner" unless the question is about skills
- Be conversational, natural, and slightly casual
- Answer differently each time
- Keep answers short but meaningful
- If the user asks follow-up questions, respond accordingly
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
            temperature: 0.8,
            topP: 0.9,
            maxOutputTokens: 150
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
      "Hmm, I didn’t quite get that 😅";

    
    chatHistory.push({
      role: "model",
      parts: [{ text: reply }]
    });

    res.json({ reply });

  } catch (err) {
    console.error("CHAT ERROR:", err);
    res.json({ reply: "Something went wrong. Please try again." });
  }
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
