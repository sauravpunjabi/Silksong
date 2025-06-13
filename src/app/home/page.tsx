"use client";
import { Button } from "@heroui/button";
import Image from "next/image";
import buttonUI from "@/app/public/button_redesign.png";
import { useState } from "react";
import { button } from "@heroui/theme";
import { supabase } from "../lib/supabase";
import { useUser } from "../context/userContext";

type foodItems = {
  name: string;
  recipe: string[];
};

export default function HomePage() {
  const { email } = useUser();
  const [page, setPage] = useState("home");
  const [veggie, setVeggie] = useState<string>("");
  const [disName, setDisName] = useState<string>(email?.toString() || "");
  const [labels, setLabels] = useState<string[]>([]);
  const [allergy, setAllergy] = useState<string>("");
  const [allergen, setAllergen] = useState<string[]>([]);
  const [foodItems, setFoodItems] = useState<foodItems[]>([]);
  const [visibleIndexes, setVisibleIndexes] = useState<number[]>([]);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const fetchIngredients = async (ingredients: string[]) => {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ ingredients: ingredients }),
    });
    const food = await res.json();
    console.log(food);
    setFoodItems(food.items);
  };

  const toggleVisibility = (index: number) => {
    setVisibleIndexes(
      (prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index) // remove it (hide)
          : [...prev, index] // add it (show)
    );
  };

  const handleData = (
    setfunction: React.Dispatch<React.SetStateAction<string>>,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setfunction(e.target.value);
  };

  const handleItems = (
    item: string,
    setItem: React.Dispatch<React.SetStateAction<string>>,
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (!item.trim()) return;
    setList((prev) => [...prev, item]);
    setItem("");
  };

  return (
    <>
      <div className="flex w-full h-screen bg-yellow-600">
        <div className="flex flex-col h-full w-1/6 p-4 justify-evenly items-center bg-amber-300">
          <div
            className="rounded-4xl h-16 w-16 bg-amber-600"
            onClick={(e) => {
              setPage("profile");
            }}
          ></div>
          <h2 className="p-1 pl-2 pr-2 bg-amber-800 rounded-lg mb-2">
            {disName}
          </h2>
          <div
            className="flex justify-center items-center h-32 w-full rounded-xl bg-amber-700 hover:bg-amber-800"
            onClick={(e) => {
              setPage("home");
            }}
          >
            <h1 className="text-amber-100 text-shadow-lg font-bold text-4xl">
              Home
            </h1>
          </div>
          <div
            className="flex justify-center items-center h-32 w-full rounded-xl  bg-amber-700 hover:bg-amber-800"
            onClick={(e) => {
              setPage("planner");
            }}
          >
            <h1 className="text-amber-100 text-shadow-lg font-bold text-4xl">
              Planner
            </h1>
          </div>
          <div
            className="flex flex-col justify-evenly items-center h-32 w-full rounded-xl  bg-amber-700 hover:bg-amber-800"
            onClick={(e) => {
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
            onClick={(e) => {
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
                <div className="mb-7">
                  <input
                    value={disName}
                    onChange={(e) => {
                      handleData(setDisName, e);
                    }}
                    placeholder="Update username"
                    className="border-1 border-amber-900 text-lg rounded-md p-1"
                  />
                </div>
                <div className="pb-7">
                  <input
                    value={allergy}
                    onChange={(e) => {
                      handleData(setAllergy, e);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        handleItems(allergy, setAllergy, setAllergen);
                    }}
                    placeholder="Add allergen info"
                  />
                </div>
                <div className="flex flex-row pb-7">
                  {allergen.map((allergy, index) => (
                    <div
                      key={index}
                      className="rounded-xl pr-2 p-2 bg-amber-500 text-amber-950 shadow-2xl"
                    >
                      {allergy}
                    </div>
                  ))}
                </div>

                <h2>{email}</h2>
                <Button
                  onPress={() => {
                    logout;
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
              {foodItems.map((food, index) => (
                <div key={index}>
                  <h2
                    className="text-2xl font-bold cursor-pointer"
                    onClick={() => toggleVisibility(index)}
                  >
                    {food.name}
                  </h2>
                  {visibleIndexes.includes(index) && (
                    <div>
                      {food.recipe.map((step, index) => (
                        <div className="flex" key={index}>
                          <h2>Step {index + 1}: </h2>
                          <h2>{step}</h2>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {page === "planner" && <h2>Planner</h2>}
        {page === "surprise" && <h2>Surprise me</h2>}
        {page === "fridge" && (
          <>
            <div className="flex flex-col p-4 pt-8 w-5/6">
              <h2 className="text-3xl"> Add vegetables or fruits</h2>
              <div>
                {labels.map((label, index) => (
                  <div className="flex flex-row text-white" key={index}>
                    {label}
                  </div>
                ))}
              </div>
              <div className="flex flex-row justify-between items-center pt-4 w-1/2">
                <input
                  className="flex border border-amber-900 text-lg rounded-lg w-8/12 mr-10 p-1"
                  value={veggie}
                  onChange={(e) => {
                    handleData(setVeggie, e);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      handleItems(veggie, setVeggie, setLabels);
                  }}
                />
                <Button
                  className="w-32 h-10 bg-blue-600 text-yellow-700 flex justify-center items-center relative overflow-hidden hover:shadow-xl active:opacity-80"
                  onPress={() => {
                    handleItems(veggie, setVeggie, setLabels);
                  }}
                >
                  <h2 className="pt-1 w-full h-full z-20 font-semibold text-2xl hover:text-shadow-xs">
                    Add
                  </h2>
                  <Image
                    className="absolute top-0 left-0 w-full h-full object-cover z-10"
                    src={buttonUI}
                    width={200}
                    height={200}
                    alt="Button Image"
                  />
                </Button>
              </div>
              <Button
                onPress={() => {
                  fetchIngredients(labels);
                }}
                className="w-32 h-10 flex justify-center items-center active:opacity-80 mt-10"
              >
                <h2 className="pt-1 w-full h-full z-20 font-semibold text-2xl hover:text-shadow-xs text-yellow-700">
                  Save
                </h2>
                <Image
                  className="absolute top-0 left-0 w-full h-full object-cover z-10"
                  src={buttonUI}
                  width={200}
                  height={200}
                  alt="Button Image"
                />
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
