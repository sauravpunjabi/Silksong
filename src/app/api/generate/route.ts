import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  const { ingredients, allergies, cuisines, mealType, diet } =
    (await req.json()) as {
      ingredients: string[];
      allergies: string[];
      cuisines: string[];
      mealType: string[];
      diet: string;
    };

  const prompt = `Generate 3 distinct food items.
Each item must be a ${diet} ${mealType} dish from ${cuisines} cuisine.
The primary ingredients for each dish must be selected from: ${ingredients}.
Strictly exclude all ingredients related to ${allergies}.

For each food item, provide:
1. A "name" for the dish.
2. A "recipe" as an array of sequential steps.
3. The estimated "calories" for the dish.

Return the response as a JSON array, exactly like this example, with no additional text or formatting outside the JSON:

[
  {
    "name": "dish name",
    "recipe": ["Step 1", "Step 2", "Step 3"],
    "calories": "calories in the dish"
  },
  {
    "name": "dish name",
    "recipe": ["Step 1", "Step 2", "Step 3"],
    "calories": "calories in the dish"
  },
  {
    "name": "dish name",
    "recipe": ["Step 1", "Step 2", "Step 3"],
    "calories": "calories in the dish"
  }
]
    `.trim();

  const res = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });

  const raw = res.text || "";

  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    const items = JSON.parse(cleaned);
    return NextResponse.json({ items });
  } catch (e) {
    console.error("Failed to parse AI response:", cleaned);
    return NextResponse.json({ error: "Invalid AI response" }, { status: 500 });
  }
}
