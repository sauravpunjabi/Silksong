"use client";

import { useState } from "react";
import { meals } from "@/lib/meals";

export default function SurprisePage() {
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [category, setCategory] = useState("");

  function getRandom(categoryKey: string) {
    const list = meals[categoryKey];
    const random = list[Math.floor(Math.random() * list.length)];

    setCategory(categoryKey);
    setSelectedMeal(random);
  }

  return (
    <div className="p-8 text-black">
      <h1 className="text-4xl font-extrabold mb-8 flex items-center gap-2">
        Surprise Me <span>🍽</span>
      </h1>

      {/* category btns */}
      <div className="flex flex-wrap gap-4 mb-8">

        <button
          onClick={() => getRandom("healthy")}
          className="px-6 py-2 bg-white/20 hover:bg-white/30 text-black font-medium rounded-full shadow-sm transition"
        >
          Healthy
        </button>

        <button
          onClick={() => getRandom("indian")}
          className="px-6 py-2 bg-white/20 hover:bg-white/30 text-black font-medium rounded-full shadow-sm transition"
        >
          Indian
        </button>

        <button
          onClick={() => getRandom("dessert")}
          className="px-6 py-2 bg-white/20 hover:bg-white/30 text-black font-medium rounded-full shadow-sm transition"
        >
          Dessert
        </button>

        <button
          onClick={() => getRandom("snack")}
          className="px-6 py-2 bg-white/20 hover:bg-white/30 text-black font-medium rounded-full shadow-sm transition"
        >
          Snack
        </button>

        <button
          onClick={() => getRandom("highProtein")}
          className="px-6 py-2 bg-white/20 hover:bg-white/30 text-black font-medium rounded-full shadow-sm transition"
        >
          High Protein
        </button>

      </div>

      {/* result card */}
      {selectedMeal && (
        <div className="p-6 border border-white/40 rounded-lg bg-white/10 backdrop-blur-sm max-w-lg">
          <h2 className="text-2xl font-semibold">{selectedMeal.name}</h2>

          <p className="text-sm mt-1">
            Category: <strong>{category}</strong>
          </p>

          <button
            onClick={() => getRandom(category)}
            className="mt-5 px-5 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition shadow"
          >
            Surprise Again
          </button>
        </div>
      )}
    </div>
  );
}