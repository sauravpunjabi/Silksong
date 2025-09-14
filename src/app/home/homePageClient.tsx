"use client";
import Image from "next/image";
import {
  deleteAllergy,
  deleteIngredient,
  logout,
  saveAllergies,
  saveIngredients,
} from "./actions";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

type Item = {
  id: number;
  name: string;
};

type foodRecipe = {
  name: string;
  recipe: string[];
  calories: number;
};

type HomePageClientProps = {
  items: Item[];
  cuisines: Item[];
  allergies: Item[];
  foodItems: Item[];
};

export default function HomePageClient({
  items,
  cuisines,
  allergies,
  foodItems,
}: HomePageClientProps) {
  const [page, setPage] = useState("home");
  const [veggie, setVeggie] = useState<string>("");

  const [allergy, setAllergies] = useState<string>("");
  const [addedItem, setAddedItems] = useState<Item[]>([]);
  const [recipeItem, setRecipeItems] = useState<foodRecipe[]>([]);
  const [mealType, setMealTypes] = useState<string>("");

  const [visibleIndexes, setVisibleIndexes] = useState<number[]>([]);

  const labels = items;
  const allergen = allergies;
  const cuisine = cuisines;
  const recipes = foodItems;

  const toggleVisibility = (index: number) => {
    setVisibleIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

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
    setRecipeItems(food.items);
  };

  const handleData = (
    setfunction: React.Dispatch<React.SetStateAction<string>>,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setfunction(e.target.value);
  };

  const handleAddedItems = async () => {
    setAddedItems((prev) => [...prev, { id: Date.now(), name: veggie.trim() }]);
    setVeggie("");
  };

  const handleSaveIngredient = async () => {
    const saveItems = addedItem.map((item) => ({ name: item.name }));
    saveIngredients(saveItems);
    setAddedItems([]);
  };

  return (
    <>
      <div className="flex w-full h-screen bg-yellow-600">
        <div className="flex flex-col h-full w-1/6 p-4 justify-evenly items-center bg-amber-300">
          <div
            className="rounded-4xl h-16 w-16 bg-amber-600"
            onClick={() => {
              setPage("profile");
            }}
          ></div>

          <div
            className="flex justify-center items-center h-32 w-full rounded-xl bg-amber-700 hover:bg-amber-800"
            onClick={() => {
              setPage("home");
            }}
          >
            <h1 className="text-amber-100 text-shadow-lg font-bold text-4xl">
              Home
            </h1>
          </div>
          <div
            className="flex justify-center items-center h-32 w-full rounded-xl  bg-amber-700 hover:bg-amber-800"
            onClick={() => {
              setPage("planner");
            }}
          >
            <h1 className="text-amber-100 text-shadow-lg font-bold text-4xl">
              Planner
            </h1>
          </div>
          <div
            className="flex flex-col justify-evenly items-center h-32 w-full rounded-xl  bg-amber-700 hover:bg-amber-800"
            onClick={() => {
              setPage("surprise");
            }}
          >
            <h1 className="text-amber-100 text-shadow-lg font-bold text-4xl">
              Surprise
            </h1>
            <h1 className="text-amber-100 text-shadow-lg font-bold text-4xl">
              me
            </h1>
          </div>
          <div
            className="flex justify-center items-center h-32 w-full rounded-xl  bg-amber-700 hover:bg-amber-800"
            onClick={() => {
              setPage("fridge");
            }}
          >
            <h1 className="text-amber-100 text-shadow-lg font-bold text-4xl">
              Fridge
            </h1>
          </div>
        </div>
        {page === "profile" && (
          <>
            <div className="flex flex-col items-center w-5/6 h-screen justify-center">
              <div className="w-28 h-28 rounded-full bg-amber-700"></div>
              <div className="flex flex-col items-center w-1/2">
                <div className="pb-7">
                  <input
                    value={allergy}
                    onChange={(e) => {
                      handleData(setAllergies, e);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveAllergies(allergy);
                    }}
                    placeholder="Add allergen info"
                  />
                </div>
                <div className="flex pr-4">
                  <div>Weight gain and lose</div>
                  <div className="pb-7">
                    <input
                      type="number"
                      value={allergy}
                      onChange={(e) => {
                        handleData(setAllergies, e);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveAllergies(allergy);
                      }}
                      placeholder="kgs"
                    />
                  </div>
                </div>
                <div className="flex flex-row pb-7">
                  {allergen.map((allergy) => (
                    <div
                      key={allergy.id}
                      className="flex rounded-xl pr-2 p-2 bg-amber-500 text-amber-950 shadow-2xl"
                    >
                      {allergy.name}
                      <h2
                        className="pl-2 text-red-800"
                        onClick={() => deleteAllergy(allergy.id)}
                      >
                        X
                      </h2>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => {
                    logout();
                  }}
                  className="bg-amber-800 text-amber-200 p-2 rounded-md"
                >
                  Logout
                </Button>
              </div>
            </div>
          </>
        )}
        {page === "home" && (
          <div>
            <h1 className="text-lg">Recipes</h1>
            <div className="flex flex-col p-2 border-2 border-slate-700">
              {recipeItem.map((food, index) => (
                <div key={index}>
                  <h2
                    className="text-2xl font-bold cursor-pointer"
                    onClick={() => toggleVisibility(index)}
                  >
                    {food.name}
                  </h2>
                  {visibleIndexes.includes(index) && (
                    // This is only visible when the recipe name is clicked
                    <div>
                      {food.recipe.map((step, index) => (
                        <div className="flex" key={index}>
                          <h2>Step {index + 1}: </h2>
                          <h2>{step}</h2>
                        </div>
                      ))}
                      <h2>{food.calories}</h2>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {page === "planner" && (
          <>
            <Calendar aria-label="Date (No Selection)" />
          </>
        )}
        {page === "surprise" && <h2>Surprise me</h2>}
        {page === "fridge" && (
          <>
            <div className="flex flex-row w-5/6">
              <div className="flex flex-col p-4 pt-8 w-1/2">
                <h2 className="text-3xl"> Add vegetables or fruits</h2>
                <div className="flex">
                  <h2>Already in fridge</h2>
                  <div>
                    {labels.map((label) => (
                      <div
                        className="flex flex-row text-lg text-white items-center"
                        key={label.id}
                      >
                        {label.name}
                        <h2
                          onClick={() => {
                            deleteIngredient(label.id);
                          }}
                          className="cursor-pointer text-red-200 text-xl pl-2"
                        >
                          X
                        </h2>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-row justify-between items-center pt-4 w-full">
                    <input
                      className="flex border border-amber-900 text-lg rounded-lg w-8/12 mr-10 p-1"
                      value={veggie}
                      onChange={(e) => {
                        handleData(setVeggie, e);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSaveIngredient;
                        }
                      }}
                    />
                    <Button
                      className="w-32 h-10 bg-blue-600 text-yellow-700 flex justify-center items-center relative overflow-hidden hover:shadow-xl active:opacity-80"
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
                    <Button
                      className="w-32 h-10 bg-blue-600 text-yellow-700 flex justify-center items-center relative overflow-hidden hover:shadow-xl active:opacity-80"
                      onClick={handleSaveIngredient}
                    >
                      <h2 className="pt-1 w-full h-full z-20 font-semibold text-2xl hover:text-shadow-xs">
                        Add these to fridge!
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

                  {/* <Button
                  onClick={() => {
                    fetchRecipes(
                      labels.map((label) => label.name),
                      allergen.map((allergen) => allergen.name)
                    );
                  }}
                  className="w-32 h-10 flex justify-center items-center active:opacity-80 mt-10"
                >
                  <h2 className="pt-1 w-full h-full z-20 font-semibold text-2xl hover:text-shadow-xs text-yellow-700">
                    Next
                  </h2>
                  <Image
                    className="absolute top-0 left-0 w-full h-full object-cover z-10"
                    src="/button_redesign.png"
                    width={200}
                    height={200}
                    alt="Button Image"
                  />
                </Button> */}
                </div>
              </div>

              <div className="flex flex-col pt-8">
                <div>
                  <div className="text-2xl">
                    <h2>What meal are you having?</h2>
                  </div>
                  <div>breakfast, lunch, dinner?</div>
                </div>
                <div className="pt-8">
                  <div className="text-2xl ">
                    <h2>What are you craving?</h2>
                  </div>
                  <div>Cuisine??</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
