"use client";

import { Raid } from "@albion-raid-manager/database/models";
import { createContext, PropsWithChildren, useContext } from "react";

type RaidsContextType = {
  raids: Raid[];
};

const RaidsContext = createContext<RaidsContextType>({ raids: [] });

export function RaidsProvider({ children, raids }: RaidsContextType & PropsWithChildren) {
  return <RaidsContext.Provider value={{ raids }}>{children}</RaidsContext.Provider>;
}

export function useRaidsContext() {
  return useContext(RaidsContext);
}
