const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
    console.log("USER MESSAGE:", userMsg);

    console.log("API KEY EXISTS:", !!process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
  model: "models/gemini-1.5-flash"
});

    const result = await model.generateContent(userMsg);

    console.log("RAW RESULT:", JSON.stringify(result, null, 2));

    const text =
      result.response.candidates[0].content.parts[0].text;

    res.json({ reply: text });

  } catch (error) {
    console.error("CHAT ERROR:", error);
    res.json({
      reply: "DEBUG ERROR",
      error: error?.message || "unknown error"
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
