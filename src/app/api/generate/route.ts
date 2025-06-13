import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  const { ingredients } = (await req.json()) as { ingredients: string[] };

  const prompt =
    `Generate 3 food items which consist mainly of these items: ${ingredients.join(
      ","
    )}.
    Return the result as an array of JSON object in this structure:
    [
      {
      "name" : "dish name",
      "recipe" : ["Step 1", "Step 2", "Step 3".... "Step N"]
      }
    ]
    `.trim();

  const res = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });

  const raw = res.text || ""; // or `await response.text();` if using new Gemini SDK

  // Strip triple backticks and optional 'json' label
  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    const items = JSON.parse(cleaned); // Now it's valid JSON
    return NextResponse.json({ items });
  } catch (e) {
    console.error("Failed to parse AI response:", cleaned);
    return NextResponse.json({ error: "Invalid AI response" }, { status: 500 });
  }
}
