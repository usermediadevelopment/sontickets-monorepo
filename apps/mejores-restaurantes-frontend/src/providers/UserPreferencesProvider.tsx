"use client";
import { Area, Category } from "@/types/sanity";
import { SCategory, SCity } from "@/types/sanity.custom.type";
import React, { createContext, useReducer, ReactNode } from "react";

type UserPreferences = {
  city: SCity;
  category: Category;
  area: Area;
};

type UserPreferencesContextType = {
  preferences: UserPreferences;
  setCity: (city: SCity) => void;
  setCategory: (category: SCategory) => void;
  setArea: (area: Area) => void;
};

export const UserPreferencesContext = createContext<
  UserPreferencesContextType | undefined
>(undefined);

type Action =
  | { type: "SET_CITY"; payload: SCity }
  | { type: "SET_CATEGORY"; payload: Category }
  | { type: "SET_AREA"; payload: Area };

const preferencesReducer = (
  state: UserPreferences,
  action: Action
): UserPreferences => {
  switch (action.type) {
    case "SET_CITY":
      return { ...state, city: action.payload };
    case "SET_CATEGORY":
      return { ...state, category: action.payload };
    case "SET_AREA":
      return { ...state, area: action.payload };
    default:
      return state;
  }
};

export const UserPreferencesProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [preferences, dispatch] = useReducer(preferencesReducer, {
    city: {} as SCity,
    category: {} as Category,
    area: {} as Area,
  });

  const setCity = (city: SCity) =>
    dispatch({ type: "SET_CITY", payload: city });
  const setCategory = (category: Category) =>
    dispatch({ type: "SET_CATEGORY", payload: category });
  const setArea = (area: Area) => dispatch({ type: "SET_AREA", payload: area });

  return (
    <UserPreferencesContext.Provider
      value={{ preferences, setCity, setCategory, setArea }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
};
