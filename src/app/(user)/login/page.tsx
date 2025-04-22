"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import Image from "next/image";
import buttonUI from "@/app/public/button_redesign.png";

export default function Login() {
  const [data, setData] = useState<{
    email: string;
    password: string;
  }>({
    email: "",
    password: "",
  });
  const [emailData, setEmailData] = useState<string | null>(null);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setEmailData(data?.user?.email ?? null);
      }
    };
    fetchUser();
  }, []);
  return (
    <>
      <div
        className="flex flex-col h-screen justify-center items-center"
        style={{ backgroundColor: "#F4C430" }}
      >
        <form
          className="flex flex-col h-screen justify-center items-center"
          action="/auth/login"
          method="post"
        >
          <h2 className="text-2xl" style={{ color: "#92374D" }}>
            LOGIN
          </h2>
          <div className="flex flex-col items-center justify-evenly h-1/2 w-full">
            <Input
              className="w-1/3 text-2xl border-2 rounded border-amber-900"
              placeholder="Email"
              onChange={handleChange}
              name="email"
              value={data?.email}
              style={{ color: "#92374D" }}
            />
            <Input
              className="w-1/3 text-2xl border-2 rounded border-amber-900"
              placeholder="Password"
              name="password"
              onChange={handleChange}
              value={data?.password}
              style={{ color: "#92374D" }}
            />
            <Button
              type="submit"
              className="w-32 h-10 bg-blue-600 text-yellow-700 text-lg flex justify-center items-center relative overflow-hidden hover:shadow-xl active:opacity-80"
            >
              <h2 className="pt-1 w-full h-full z-20 font-semibold text-2xl hover:text-shadow-xs font-sans">
                Login
              </h2>
              <Image
                className="absolute top-0 left-0 w-full h-full object-cover z-10"
                src={buttonUI}
                width={200}
                height={200}
                alt="Button Image"
              />
            </Button>
            <h2>{emailData}</h2>
          </div>
        </form>
      </div>
    </>
  );
}
