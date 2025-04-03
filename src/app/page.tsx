"use client";
import Image from "next/image";
import PotatoImage from "@/app/public/potato_img.jpg";

export default function Home() {
  return (<>
    <div className="flex w-full h-full">
      <Image className="absolute w-full -z-10" alt="A potato bg" width={500} height={500} src={PotatoImage} />
    </div>
    <div className="flex top-48 h-screen text-4xl flex-col justify-center items-center w-full" >
      <h1 className="flex justify-center font-bold text-white">Welcome to Potato!</h1>
      <h1 className="flex justify-center font-bold text-white">Your meal planning is going to change forever!</h1>
    </div>
  </>);
}