"use client";
import useGetLocations from "@/hooks/useGetLocations";
import CardLocationItem from "./CardLocationItem";
import { CardShimmer } from "./loader/CardShimmer";

const ListLocations = () => {
  const { locations, isLoading } = useGetLocations();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
        {[...Array(6)].map((_, index) => (
          <CardShimmer key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
      {locations.length &&
        locations.map((location) => {
          return <CardLocationItem key={location._id} location={location} />;
        })}
    </div>
  );
};

export default ListLocations;
