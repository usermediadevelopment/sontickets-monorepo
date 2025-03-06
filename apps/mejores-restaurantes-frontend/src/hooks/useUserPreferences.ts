import { UserPreferencesContext } from "@/providers/UserPreferencesProvider";
import { useContext } from "react";

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error(
      "useUserPreferences must be used within a UserPreferencesProvider"
    );
  }
  return context;
};
