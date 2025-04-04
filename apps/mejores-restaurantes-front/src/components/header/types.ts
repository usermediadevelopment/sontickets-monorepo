import { Hit } from "algoliasearch";

export type HitsListProps = {
  onClick: (hit: Hit) => void;
};

export type CustomSearchBoxProps = {
  defaultQuery?: string;
  onFocus?: () => void;
};
