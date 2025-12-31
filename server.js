const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const myProjectsList = [
  {
    id: 1,
    title: "HTML Only Page",
    desc: "This was my first assignment I made using only HTML tags.",
    tech: "HTML5"
  },
  {
    id: 2,
    title: "Calculator App",
    desc: "I tried to make a calculator logic but it has some bugs.",
    tech: "JavaScript, HTML, CSS"
  },
  {
    id: 3,
    title: "Weather Widget",
    desc: "Fetches weather but design is very basic.",
    tech: "React, API"
  }
];

const myCerts = [
  "Intro to Web Dev (Coursera)",
  "JavaScript Basics (YouTube)",
  "Python for Beginners"
];

app.get('/', (req, res) => {
  res.send("Server is running okay.");
});

app.get('/api/projects', (req, res) => {
  res.json(myProjectsList);
});

app.get('/api/certifications', (req, res) => {
  res.json(myCerts);
});

app.post('/api/chat', async (req, res) => {
  try {
    const userMsg = req.body.message;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a chatbot on a college student's personal portfolio website.

Context about the student:
- Degree: Bachelor's student
- Focus: Learning web development
- Skills: HTML, CSS, JavaScript, basic React, basic Node.js
- Projects:
  1) HTML Only Page – first assignment using only HTML
  2) Calculator App – basic calculator with some bugs
  3) Weather Widget – basic React app using an API
- Personality: Friendly, honest, beginner, not overconfident

Rules:
- Answer clearly and directly.
- Do NOT say "I don’t know" unless the question is unrelated.
- Do NOT repeat that you are a beginner in every answer.
- If asked about projects, list them confidently.
- If asked about studies, mention bachelor's degree.
- Keep responses short, human, and natural.

User question: ${userMsg}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Hmm… I’m not sure, but I’ll try to learn more about it 😅";

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
