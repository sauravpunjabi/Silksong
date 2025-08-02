"use client";
import { Button } from "@heroui/button";
import Image from "next/image";
import buttonUI from "@/app/public/button_redesign.png";
import { useEffect, useState } from "react";
import { button } from "@heroui/theme";
import { supabase } from "../lib/supabase";
import { useUser } from "../context/userContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type foodItems = {
  name: string;
  recipe: string[];
  calories: number;
};

export default function HomePage() {
  const { email } = useUser();
  const [page, setPage] = useState("home");
  const [veggie, setVeggie] = useState<string>("");
  const [disName, setDisName] = useState<string>(email?.toString() || "");
  const [labels, setLabels] = useState<{ id: number; name: string }[]>([]);
  const [allergy, setAllergy] = useState<string>("");
  const [allergen, setAllergen] = useState<{ id: number; name: string }[]>([]);
  const [foodItems, setFoodItems] = useState<foodItems[]>([]);
  const [cuisine, setCuisine] = useState<string>("");
  const [mealType, setMealType] = useState<string>("");
  const [visibleIndexes, setVisibleIndexes] = useState<number[]>([]);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase.from("fridge").select("*");

      if (!error && data) {
        const items = data.map((item) => item.name);
        console.log("Fridge data: ", items);
        setLabels(data);
      }
      if (error) {
        console.log("Error in showing fridge data: ", error);
      }
    };
    fetchItems();
    const fetchAllergies = async () => {
      const { data, error } = await supabase.from("allergy").select("*");

      if (error) {
        console.log("Error: ", error);
      } else {
        console.log(data);
        setAllergen(data);
      }
    };
    fetchAllergies();
    const fetchCuisine = async () => {
      const { data, error } = await supabase.from("cuisine").select("*");

      if (error) {
        console.log("Error: ", error);
      } else {
        console.log(data);
        setAllergen(data);
      }
    };
    fetchCuisine();
  }, []);

  // When you press on Next button
  const fetchIngredients = async (
    ingredients: string[],
    allergies: string[]
  ) => {
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

  const saveIngredients = async () => {
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
  };

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

  // const saveCuisine = async() => {
  //   if(!cuisine.trim()) return;
  //   const (data, error) = await supabase.from("cuisine").insert([{name: cuisine.trim()}]).select();
  //   if(error){
  //     console.log("error: ", error);
  //   }
  // }

  const toggleVisibility = (index: number) => {
    setVisibleIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleData = (
    setfunction: React.Dispatch<React.SetStateAction<string>>,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setfunction(e.target.value);
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
          <h2 className="p-1 pl-2 pr-2 bg-amber-800 rounded-lg mb-2">
            {disName}
          </h2>
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
                      if (e.key === "Enter") saveAllergies();
                    }}
                    placeholder="Add allergen info"
                  />
                </div>
                <div className="flex pr-4">
                  <div>
                    <Select>
                      <SelectTrigger className="w-[180px]"></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gain">Gain</SelectItem>
                        <SelectItem value="lose">Lose</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="pb-7">
                    <input
                      type="number"
                      value={allergy}
                      onChange={(e) => {
                        handleData(setAllergy, e);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveAllergies();
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
                      <h2>{food.calories}</h2>
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
            <div className="flex flex-row w-5/6">
              <div className="flex flex-col p-4 pt-8 w-1/2">
                <h2 className="text-3xl"> Add vegetables or fruits</h2>
                <div>
                  {labels.map((label) => (
                    <div
                      className="flex flex-row text-lg text-white items-center"
                      key={label.id}
                    >
                      {label.name}
                      <h2
                        onClick={() => {
                          deleteIngredients(label.id);
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
                      if (e.key === "Enter") saveIngredients();
                    }}
                  />
                  <Button
                    className="w-32 h-10 bg-blue-600 text-yellow-700 flex justify-center items-center relative overflow-hidden hover:shadow-xl active:opacity-80"
                    onPress={saveIngredients}
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
                    fetchIngredients(
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
                    src={buttonUI}
                    width={200}
                    height={200}
                    alt="Button Image"
                  />
                </Button>
              </div>

              <div className="flex flex-col pt-8">
                <div>
                  <div className="text-2xl">
                    <h2>What meal are you having?</h2>
                  </div>
                  <div>
                    <Select onValueChange={setMealType} value={mealType}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Meal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breakfast">Breakfast</SelectItem>
                        <SelectItem value="lunch">Lunch</SelectItem>
                        <SelectItem value="dinner">Dinner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="pt-8">
                  <div className="text-2xl ">
                    <h2>What are you craving?</h2>
                  </div>
                  <div>
                    <Select onValueChange={setCuisine} value={cuisine}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Cuisine" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="indian">Indian</SelectItem>
                        <SelectItem value="chinese">Chinese</SelectItem>
                        <SelectItem value="italian">Italian</SelectItem>
                        <SelectItem value="korean">Korean</SelectItem>
                        <SelectItem value="european">European</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
