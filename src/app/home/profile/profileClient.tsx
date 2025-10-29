// app/home/profile/ProfileClient.tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteAllergy, saveAllergies, logout } from "../actions"; // Adjust path if needed
import { type Item } from "./page"; // Import the type from our server component

// Define the props we expect from the server component
type ProfileClientProps = {
  initialAllergies: Item[];
};

export default function ProfileClient({
  initialAllergies,
}: ProfileClientProps) {
  // State for the text in the input box
  const [allergy, setAllergy] = useState<string>("");

  // State for the "tray" of *new* allergies you've added
  const [addedAllergy, setAddedAllergies] = useState<Item[]>([]);

  // State for the list of *saved* allergies (from the DB)
  // We put the prop into state so we can remove items on delete
  const [savedAllergies, setSavedAllergies] =
    useState<Item[]>(initialAllergies);

  // This function adds the input-box text to the "tray"
  const handleAddedAllergies = () => {
    const trimmed = allergy.trim();
    if (!trimmed) return;

    // Add to the "tray" (local state)
    setAddedAllergies((prev) => [...prev, { id: Date.now(), name: trimmed }]);
    // Clear the input box
    setAllergy("");
  };

  // This function saves the "tray" to the database
  const handleSaveToDb = async () => {
    // Get just the names from the "tray"
    const allergyNames = addedAllergy.map((item) => ({ name: item.name }));
    if (allergyNames.length === 0) return;

    // 1. Call the server action
    await saveAllergies(allergyNames);

    // 2. Optimistic Update: Move items from the tray to the saved list
    setSavedAllergies((prev) => [...prev, ...addedAllergy]);

    // 3. Clear the tray
    setAddedAllergies([]);
  };

  // This function deletes an allergy from the database
  const handleDeleteFromDb = async (id: number) => {
    // 1. Call the server action
    await deleteAllergy(id);

    // 2. Optimistic Update: Remove the item from the saved list UI
    setSavedAllergies((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="flex flex-col items-center w-full h-screen justify-center p-4">
      <div className="w-28 h-28 rounded-full bg-amber-700"></div>
      <h2>Name</h2>
      <div className="flex flex-col items-center w-1/2">
        <div className="pb-7">
          <input
            value={allergy}
            onChange={(e) => setAllergy(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddedAllergies();
            }}
            placeholder="Add allergen info"
          />
        </div>

        {/* --- List of SAVED allergies (from DB) --- */}
        <div className="flex flex-row pb-7">
          {savedAllergies.map((item) => (
            <div
              key={item.id}
              className="flex rounded-xl pr-2 p-2 bg-amber-500 text-amber-950 shadow-2xl"
            >
              {item.name}
              <h2
                className="pl-2 text-red-800 cursor-pointer"
                onClick={() => handleDeleteFromDb(item.id)}
              >
                X
              </h2>
            </div>
          ))}
        </div>

        {/* --- "Tray" of NEWLY ADDED allergies (local state) --- */}
        <div className="flex flex-row pb-7">
          {addedAllergy.map((item) => (
            <div
              key={item.id}
              className="flex rounded-xl pr-2 p-2 bg-amber-300 text-amber-950"
            >
              {item.name}
              <h2
                className="pl-2 text-gray-500 cursor-pointer"
                onClick={() =>
                  setAddedAllergies((prev) =>
                    prev.filter((a) => a.id !== item.id)
                  )
                }
              >
                x
              </h2>
            </div>
          ))}
        </div>

        {/* This button saves the "tray" to the DB */}
        <Button
          onClick={handleSaveToDb}
          className="bg-amber-900 text-amber-100 p-2 rounded-md"
        >
          Save
        </Button>

        <Button
          onClick={() => logout()}
          className="bg-amber-800 text-amber-200 p-2 rounded-md mt-4"
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
