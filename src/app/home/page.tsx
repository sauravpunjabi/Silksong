"use client";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import Image from "next/image";
import buttonUI from "@/app/public/button_redesign.png";
import { useState } from "react";
import { button } from "@heroui/theme";
import { supabase } from "../lib/supabase";
import { useUser } from "../context/userContext";

export default function HomePage() {
  const [page, setPage] = useState("home");
  const [veggie, setVeggie] = useState("");
  const [labels, setLabels] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVeggie(e.target.value);
  };

  const onAdd = () => {
    setLabels((prev) => [...prev, veggie]);
    setVeggie("");
  };

  const { email } = useUser();

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
          <div
            className="flex justify-center items-center h-36 w-full rounded-xl bg-blue-400 hover:bg-blue-500"
            onClick={(e) => {
              setPage("home");
            }}
          >
            <h1 className="text-white font-bold text-4xl">Home</h1>
          </div>
          <div
            className="flex justify-center items-center h-36 w-full rounded-xl  bg-blue-400 hover:bg-blue-500"
            onClick={(e) => {
              setPage("planner");
            }}
          >
            <h1 className="text-white font-bold text-4xl">Planner</h1>
          </div>
          <div
            className="flex justify-center items-center h-36 w-full rounded-xl  bg-blue-400 hover:bg-blue-500"
            onClick={(e) => {
              setPage("surprise");
            }}
          >
            <h1 className="text-white font-bold text-4xl">Surprise Me</h1>
          </div>
          <div
            className="flex justify-center items-center h-36 w-full rounded-xl  bg-blue-400 hover:bg-blue-500"
            onClick={(e) => {
              setPage("fridge");
            }}
          >
            <h1 className="text-white font-bold text-4xl">Fridge</h1>
          </div>
        </div>
        {page === "profile" && (
          <>
            <div className="">
              <h2>{email}</h2>
            </div>
          </>
        )}
        {page === "home" && <h2>Home Page</h2>}
        {page === "planner" && <h2>Planner</h2>}
        {page === "surprise" && <h2>Surprise Me</h2>}
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
                <Input
                  className="flex border-2 border-amber-900 text-lg rounded-lg w-8/12 mr-10"
                  placeholder="Enter items!"
                  value={veggie}
                  onChange={handleChange}
                />
                <Button
                  className="w-32 h-10 bg-blue-600 text-yellow-700 text-lg flex justify-center items-center relative overflow-hidden hover:shadow-xl active:opacity-80"
                  onPress={onAdd}
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
            </div>
          </>
        )}
      </div>
    </>
  );
}
