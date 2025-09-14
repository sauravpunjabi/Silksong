"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../lib/supabase/server";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

// export async function fetchItems() {
//   const supabase = await createClient();
//   const { data, error } = await supabase.from("fridge").select("*");

//   if (!error && data) {
//     const items = data.map((item) => item.name);
//     console.log("Fridge data: ", items);
//     // setLabels(data);
//   }
//   if (error) {
//     console.log("Error in showing fridge data: ", error);
//   }
// }

export async function saveIngredients(veggie: { name: string }[]) {
  const supabase = await createClient();
  console.log("save Ingredients called");
  if (!veggie || veggie.length === 0) return;
  const { error } = await supabase.from("fridge").insert(veggie);
  if (error) {
    console.log("Error saving ingredients to fridge: ", error);
  }
  revalidatePath("/home");
}

export async function deleteIngredient(index: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fridge")
    .delete()
    .eq("id", index);
  if (error) {
    console.log("Deletion Error:", error);
  } else {
    console.log("Deletion success!", data);
  }
  //   setLabels((prev) => prev.filter((item) => item.id !== index));

  revalidatePath("/home");
}

export async function saveAllergies(allergy: string) {
  if (!allergy.trim()) return;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("allergy")
    .insert([{ name: allergy.trim() }])
    .select();

  if (error) {
    console.log("Error: ", error);
  } else if (data && data.length > 0) {
    console.log(data);
    // setAllergen((prev) => [...prev, data[0]]);
    // setAllergy("");
  }

  revalidatePath("/home");
}

export async function deleteAllergy(index: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("allergy")
    .delete()
    .eq("id", index);
  if (error) {
    console.log("Error: ", error);
  } else {
    console.log("Allergy deleted!", data);
    // setAllergen((prev) => prev.filter((allergy) => allergy.id !== index));
  }

  revalidatePath("/home");
}
