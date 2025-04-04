import { SPlace } from "@/types/places";
import { Hit } from "algoliasearch";
import { Dispatch, SetStateAction } from "react";

export type HitsListProps = {
  onClick: (hit: Hit | SPlace) => void;
};

export type CustomSearchBoxProps = {
  defaultQuery?: string;
  onFocus?: () => void;
  inputValue: string;
  setInputValue: Dispatch<SetStateAction<string>>;
};
