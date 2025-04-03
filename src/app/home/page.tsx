"use client";
import { useState } from "react";

export default function HomePage() {
    const [page, setPage] = useState("home")



    return (<>

        <div className="flex w-full h-screen bg-yellow-600">
            <div className="flex flex-col h-full w-1/6 p-4 justify-evenly bg-amber-300">
                <div className="flex justify-center items-center h-36 w-full  bg-blue-400" onClick={(e) => { setPage("home") }}>
                    <h1 className="text-white font-bold text-4xl">Home</h1>
                </div>
                <div className="flex justify-center items-center h-36 w-full  bg-blue-400" onClick={(e) => { setPage("planner") }}>
                    <h1 className="text-white font-bold text-4xl">Planner</h1>
                </div>
                <div className="flex justify-center items-center h-36 w-full  bg-blue-400" onClick={(e) => { setPage("surprise") }}>
                    <h1 className="text-white font-bold text-4xl">Surprise Me</h1>
                </div>
                <div className="flex justify-center items-center h-36 w-full  bg-blue-400" onClick={(e) => { setPage("fridge") }}>
                    <h1 className="text-white font-bold text-4xl">Fridge</h1>
                </div>
            </div>

            {page === "home" && <h2>Home Page</h2>}
            {page === "planner" && <h2>Planner</h2>}
            {page === "surprise" && <h2>Surprise Me</h2>}
            {page === "fridge" && <h2>Fridge</h2>}

        </div>

    </>);
}