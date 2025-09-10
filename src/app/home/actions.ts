"use server";

import { createClient } from "../lib/supabase/server";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

export async function fetchItems() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("fridge").select("*");

  if (!error && data) {
    const items = data.map((item) => item.name);
    console.log("Fridge data: ", items);
    setLabels(data);
  }
  if (error) {
    console.log("Error in showing fridge data: ", error);
  }
}

const fetchRecipes = async (ingredients: string[], allergies: string[]) => {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({
      ingredients: ingredients,
      allergies: allergies,
      cuisine: cuisine,
      mealType: mealType,
    }),
  });
  const food = await res.json();
  console.log(food);
  setFoodItems(food.items);
};

export default async function saveIngredients(veggie: string) {
  const supabase = await createClient();
  console.log("called");
  if (!veggie.trim()) return;
  const { data, error } = await supabase
    .from("fridge")
    .insert([{ name: veggie.trim() }])
    .select();

  if (error) {
    console.log("Error:", error);
  } else if (data && data.length > 0) {
    setLabels((prev) => [...prev, data[0]]);
    setVeggie("");
    console.log("Data successfully added!");
  }
}

const deleteIngredients = async (index: number) => {
  const { data, error } = await supabase
    .from("fridge")
    .delete()
    .eq("id", index);
  if (error) {
    console.log("Deletion Error:", error);
  } else {
    console.log("Deletion success!", data);
  }
  setLabels((prev) => prev.filter((item) => item.id !== index));
};

const saveAllergies = async () => {
  if (!allergy.trim()) return;
  const { data, error } = await supabase
    .from("allergy")
    .insert([{ name: allergy.trim() }])
    .select();

  if (error) {
    console.log("Error: ", error);
  } else if (data && data.length > 0) {
    console.log(data);
    setAllergen((prev) => [...prev, data[0]]);
    setAllergy("");
  }
};

const deleteAllergy = async (index: number) => {
  const { data, error } = await supabase
    .from("allergy")
    .delete()
    .eq("id", index);
  if (error) {
    console.log("Error: ", error);
  } else {
    console.log("Allergy deleted!", data);
    setAllergen((prev) => prev.filter((allergy) => allergy.id !== index));
  }
};
