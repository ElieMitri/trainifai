// server.js or index.js

// 🧠 Always load environment variables first
require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 3001;

// ✅ Check OpenAI API key loaded
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY is missing! Check your .env file.");
  process.exit(1); // Stop the server if key isn't set
} else {
  console.log("🔑 OpenAI Key loaded successfully.");
}

// 🛡️ Middleware
app.use(cors());
app.use(express.json());

// ✅ Health check route (optional but useful)
app.get("/", (req, res) => {
  res.send("✅ Backend is up and running");
});

// 🔥 Main route
app.post("/generate", async (req, res) => {
  const { calories, protein, carbs, fats } = req.body;

  // 🧪 Validate input
  const isValid = [calories, protein, carbs, fats].every(
    (val) => typeof val === "number" && !isNaN(val)
  );

  if (!isValid) {
    return res
      .status(400)
      .json({ error: "Invalid or missing macronutrient values." });
  }

  const prompt = `
You are a nutritionist AI assistant. Create a one-day meal plan that exactly matches the following nutritional targets:

TARGET NUTRITION:
- Calories: ${calories} kcal
- Protein: ${protein}g
- Carbohydrates: ${carbs}g
- Fats: ${fats}g

MEAL PLAN STRUCTURE (REQUIRED FORMAT):

Meal: <Meal Name>
- Food 1: <Item> - <Portion Size>
- Food 2: <Item> - <Portion Size>
...
Macros for this meal:
- Calories: <number> kcal
- Protein: <number> g
- Carbs: <number> g
- Fats: <number> g

(Repeat above for Lunch, Dinner, Snack 1, Snack 2 if needed)

FINAL TOTAL (must match targets):
- Total Calories: ${calories} kcal
- Total Protein: ${protein} g
- Total Carbs: ${carbs} g
- Total Fats: ${fats} g

RESTRICTIONS:
- Use only plain text.
- Do not use markdown or bullet points.
- Do not add introductions or summaries.
- Keep the format strictly as shown above.
`;

  try {
    const aiResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const mealPlan = aiResponse?.data?.choices?.[0]?.message?.content;

    if (!mealPlan || typeof mealPlan !== "string") {
      console.error("❌ Unexpected OpenAI response:", aiResponse.data);
      return res.status(502).json({ error: "Invalid response from OpenAI." });
    }

    console.log("✅ Meal plan generated successfully.");
    res.status(200).json({ mealPlan });
  } catch (error) {
    console.error(
      "🔥 OpenAI API Error:",
      error.response?.data || error.message || error
    );
    res.status(500).json({
      error: "Failed to generate meal plan. Please try again.",
      details: error.response?.data || error.message || "Unknown error",
    });
  }
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
