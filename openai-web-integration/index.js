const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// POST /generate - Create meal plan using OpenAI
app.post("/generate", async (req, res) => {
  const { calories, protein, carbs, fats } = req.body;

  // Validate request body
  if (
    typeof calories !== "number" ||
    typeof protein !== "number" ||
    typeof carbs !== "number" ||
    typeof fats !== "number"
  ) {
    return res
      .status(400)
      .json({ error: "Invalid or missing macronutrient values." });
  }

  const prompt = `
Create a meal plan for one day that EXACTLY matches the following nutritional goals:
- Calories: ${calories} kcal
- Protein: ${protein}g
- Carbohydrates: ${carbs}g
- Fats: ${fats}g

Requirements:
- Include 3 meals (breakfast, lunch, dinner) and up to 2 snacks.
- Each meal/snack should show:
  - List of food items with portion sizes.
  - Macronutrient breakdown (protein, carbs, fat) and CALORIES for that meal.
- Total macronutrients and total calories at the end of the plan must exactly match the target.
- Keep the formatting clear and structured.

Use realistic foods and portion sizes.
  `;

  try {
    const openAiResponse = await axios.post(
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

    const mealPlan = openAiResponse?.data?.choices?.[0]?.message?.content;

    if (!mealPlan || typeof mealPlan !== "string") {
      console.error("❌ Invalid response from OpenAI:", openAiResponse.data);
      return res
        .status(500)
        .json({ error: "Invalid response format from OpenAI." });
    }

    return res.status(200).json({ mealPlan });
  } catch (error) {
    const openAiError = error.response?.data || error.message || error;
    console.error("🔥 OpenAI API Error:", openAiError);
    return res.status(500).json({ error: "Failed to generate meal plan." });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});