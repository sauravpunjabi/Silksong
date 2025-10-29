"use client";
// app/home/layout.tsx
import Link from "next/link";

// A new client component just for the sidebar to make it interactive

import { usePathname } from "next/navigation";

function Sidebar() {
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    return pathname === path
      ? "bg-amber-800" // Active link style
      : "bg-amber-700 hover:bg-amber-800"; // Default style
  };

  return (
    <div className="flex flex-col h-full w-1/6 p-4 justify-evenly items-center bg-amber-300">
      <Link href="/home/profile">
        <div className="rounded-4xl h-16 w-16 bg-amber-600 cursor-pointer"></div>
      </Link>

      <Link
        href="/home"
        className={`flex justify-center items-center h-32 w-full rounded-xl ${getLinkClass(
          "/home"
        )}`}
      >
        <h1 className="text-amber-100 text-shadow-lg font-bold text-4xl">
          Home
        </h1>
      </Link>
      <Link
        href="/home/planner"
        className={`flex justify-center items-center h-32 w-full rounded-xl ${getLinkClass(
          "/home/planner"
        )}`}
      >
        <h1 className="text-amber-100 text-shadow-lg font-bold text-4xl">
          Planner
        </h1>
      </Link>
      <Link
        href="/home/surprise"
        className={`flex flex-col justify-evenly items-center h-32 w-full rounded-xl ${getLinkClass(
          "/home/surprise"
        )}`}
      >
        <h1 className="text-amber-100 text-shadow-lg font-bold text-4xl">
          Surprise
        </h1>
        <h1 className="text-amber-100 text-shadow-lg font-bold text-4xl">me</h1>
      </Link>
      <Link
        href="/home/fridge"
        className={`flex justify-center items-center h-32 w-full rounded-xl ${getLinkClass(
          "/home/fridge"
        )}`}
      >
        <h1 className="text-amber-100 text-shadow-lg font-bold text-4xl">
          Fridge
        </h1>
      </Link>
    </div>
  );
}

// The main layout component
export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full h-screen bg-yellow-600">
      <Sidebar />
      {/* 'children' will be the specific page.tsx file that is active */}
      <div className="w-5/6 h-screen overflow-y-auto">{children}</div>
    </div>
  );
}
