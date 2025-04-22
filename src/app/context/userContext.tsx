"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type userContextType = {
  email: string | null;
};

const UserContext = createContext<userContextType>({ email: null });

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error) {
        setEmail(data?.user?.email ?? null);
      }
    };
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ email }}>{children}</UserContext.Provider>
  );
};
export const useUser = () => useContext(UserContext);
