// app/home/fridge/FridgeClient.tsx
"use client";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteIngredient, saveIngredients } from "../actions"; // Adjust path if needed
import { useRouter } from "next/navigation";
import { type Item } from "./page"; // Import the type from our server component

// Define the props interface
type FridgeClientProps = {
  initialFridgeItems: Item[];
  initialAllergens: Item[];
  initialCuisines: Item[];
};

export default function FridgeClient({
  initialFridgeItems,
  initialAllergens,
  initialCuisines,
}: FridgeClientProps) {
  const router = useRouter(); // Initialize the router

  // State for this page
  const [veggie, setVeggie] = useState<string>("");
  const [addedItem, setAddedItems] = useState<Item[]>([]);
  const [mealType, setMealTypes] = useState<string>("");

  // Data from server is initialized into state
  const [labels, setLabels] = useState<Item[]>(initialFridgeItems);
  const [allergen, setAllergen] = useState<Item[]>(initialAllergens);
  const [cuisine, setCuisine] = useState<Item[]>(initialCuisines);

  const handleData = (
    setfunction: React.Dispatch<React.SetStateAction<string>>,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setfunction(e.target.value);
  };

  const handleAddedItems = async () => {
    const trimmed = veggie.trim();
    if (!trimmed) return;
    setAddedItems((prev) => [...prev, { id: Date.now(), name: trimmed }]);
    setVeggie("");
  };

  const deleteItem = async (id: number) => {
    setAddedItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSaveIngredient = async () => {
    const itemsToSave = addedItem.map((item) => ({ name: item.name }));
    if (itemsToSave.length === 0) return;
    console.log("Item added: ", itemsToSave);
    // 1. Call server action to save to DB
    await saveIngredients(itemsToSave);

    // 2. Optimistic update: move items from tray to fridge list
    // We use temporary IDs here. A more complex setup would return new IDs from the action.
    const newItemsWithTempIds = addedItem.map((item) => ({
      ...item,
      id: Date.now(),
    }));
    setLabels((prev) => [...prev, ...newItemsWithTempIds]);

    // 3. Clear the tray
    setAddedItems([]);
  };

  const handleDeleteIngredient = async (id: number) => {
    // 1. Call server action to delete from DB
    await deleteIngredient(id);
    // 2. Update state to remove it from the UI
    setLabels((prev) => prev.filter((item) => item.id !== id));
  };

  const handleFindRecipes = () => {
    // 1. Combine all ingredients from the fridge list AND the tray
    const allIngredients = [
      ...labels.map((item) => item.name),
      ...addedItem.map((item) => item.name),
    ];
    const allAllergens = allergen.map((item) => item.name);
    const allCuisines = cuisine.map((item) => item.name);

    // 2. Create URL search params
    const params = new URLSearchParams();
    allIngredients.forEach((item) => params.append("ingredients", item));
    allAllergens.forEach((item) => params.append("allergies", item));
    allCuisines.forEach((item) => params.append("cuisines", item));
    if (mealType.trim()) {
      params.set("mealType", mealType.trim());
    }

    // 3. Navigate to the 'home' page with the params
    router.push(`/home?${params.toString()}`);
  };

  return (
    <div className="flex flex-row w-full p-4">
      <div className="flex flex-col p-4 pt-8 mr-4 w-1/2 border-2 border-yellow-950 rounded-2xl">
        <h2 className="text-3xl"> Add vegetables or fruits</h2>
        <div className="flex">
          {/* --- Column 1: Already in Fridge --- */}
          <div className="flex flex-col w-1/2 pr-2">
            <h2>Already in fridge</h2>
            <div>
              {labels.map((label) => (
                <div
                  className="flex flex-row text-lg text-white items-center"
                  key={label.id}
                >
                  {label.name}
                  <h2
                    onClick={() => handleDeleteIngredient(label.id)}
                    className="cursor-pointer text-red-200 text-xl pl-2"
                  >
                    X
                  </h2>
                </div>
              ))}
            </div>
          </div>

          {/* --- Column 2: Tray & Add Button --- */}
          <div className="flex flex-col w-1/2 pl-2">
            <h2>Tray</h2>
            <div>
              {addedItem.map((item) => (
                <div
                  className="flex flex-row text-lg text-white items-center"
                  key={item.id}
                >
                  {item.name}
                  <h2
                    onClick={() => deleteItem(item.id)}
                    className="cursor-pointer text-red-200 text-xl pl-2"
                  >
                    X
                  </h2>
                </div>
              ))}
            </div>

            {/* Input and Add Button */}
            <div className="flex flex-row justify-between items-center pt-4 w-full">
              <input
                className="flex border border-amber-900 text-lg rounded-lg w-full mr-2 p-1"
                value={veggie}
                onChange={(e) => handleData(setVeggie, e)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddedItems();
                }}
                placeholder="Add item..."
              />
              <Button
                className="w-20 h-10 bg-blue-600 text-yellow-700 flex justify-center items-center relative overflow-hidden hover:shadow-xl active:opacity-80"
                onClick={handleAddedItems}
              >
                <h2 className="pt-1 w-full h-full z-20 font-semibold text-2xl hover:text-shadow-xs">
                  Add
                </h2>
                <Image
                  className="absolute top-0 left-0 w-full h-full object-cover z-10"
                  src="/btn_curr.png"
                  width={200}
                  height={200}
                  alt="Button Image"
                />
              </Button>
            </div>

            {/* Save Tray Button */}
            <div className="flex flex-row mt-4">
              <Button
                className="w-full h-10 bg-blue-600 text-yellow-700 flex justify-center items-center relative overflow-hidden hover:shadow-xl active:opacity-80"
                onClick={handleSaveIngredient}
              >
                <h2 className="pt-1 w-full h-full z-20 font-semibold text-xl hover:text-shadow-xs">
                  Add tray to fridge!
                </h2>
                <Image
                  className="absolute top-0 left-0 w-full h-full object-cover z-10"
                  src="/btn_curr.png"
                  width={200}
                  height={200}
                  alt="Button Image"
                />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Right-hand Panel (Meal Type, Cuisine, Next) --- */}
      <div className="flex flex-col p-8 border-2 w-1/2 border-yellow-900 rounded-2xl">
        <div>
          <div className="text-2xl">
            <h2>What meal are you having?</h2>
          </div>
          <input
            placeholder="breakfast, lunch, dinner?"
            value={mealType}
            onChange={(e) => setMealTypes(e.target.value)}
            className="p-1 rounded-md w-full"
          />
        </div>
        <div className="pt-8">
          <div className="text-2xl ">
            <h2>What are you craving?</h2>
            {/* You can map over and display cuisines here */}
            <div>
              {cuisine.map((c) => (
                <span
                  key={c.id}
                  className="p-1 m-1 bg-amber-200 rounded-md inline-block"
                >
                  {c.name}
                </span>
              ))}
            </div>
          </div>

          {/* Next Button */}
          <Button
            onClick={handleFindRecipes}
            className="w-32 h-10 flex justify-center items-center mt-auto" // mt-auto pushes to bottom
          >
            <h2 className="pt-1 w-full h-full z-20 font-semibold text-2xl hover:text-shadow-xs text-yellow-700">
              Next
            </h2>
          </Button>
        </div>
      </div>
    </div>
  );
}
