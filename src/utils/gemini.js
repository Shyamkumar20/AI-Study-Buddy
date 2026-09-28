const { GoogleGenerativeAI } = require("@google/generative-ai");

const placeholderKey = "AQ.Ab8RN6KtOAsPANA54OWBq0kWsiffkDaKrs_lGPQOcTrIeezDQg";

const getModel = () => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey || apiKey === placeholderKey) {
    throw new Error("GEMINI_API_KEY is missing or still set to the placeholder value.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
  });
};

const askGemini = async (prompt) => {
  const model = getModel();
  const result = await model.generateContent(prompt);
  return result.response.text();
};

module.exports = { askGemini };
