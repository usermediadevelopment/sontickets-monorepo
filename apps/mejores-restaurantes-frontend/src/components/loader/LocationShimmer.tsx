export const LocationShimmer = () => (
  <div className="p-4 border rounded-lg shadow-lg bg-white animate-pulse space-y-4">
    <div className="flex flex-row gap-5">
      <div className="w-full h-64 bg-gray-200 rounded-md" />
      <div className="w-full h-64 bg-gray-200 rounded-md" />
      <div className="w-full h-64 bg-gray-200 rounded-md" />
    </div>

    <div className="flex flex-row mt-40">
      <div className="flex flex-col flex-grow gap-2">
        <div className="w-[70px] h-3 bg-gray-200 rounded-md" />
        {/* Título de carga */}
        <div className="w-7/12 h-4 bg-gray-200 rounded-md" />
        <div className="w-3/12 h-4 bg-gray-200 rounded-md" />
        <div className="w-2/12 h-4 bg-gray-200 rounded-md" />

        <div className="w-7/12 h-4 bg-gray-200 rounded-md" />
      </div>
      <div className="flex">
        <div className="w-96  h-72 bg-gray-200 rounded-md" />
      </div>
    </div>
  </div>
);

export const ImageSwiperShimmer = () => {
  return (
    <div className="rounded-lg animate-pulse ">
      <div className="flex  flex-col md:flex-row gap-3">
        <div className="w-full h-64 bg-gray-200 rounded-md" />
        <div className="w-full h-64 bg-gray-200 rounded-md hidden md:block" />
        <div className="w-full h-64 bg-gray-200 rounded-md hidden md:block" />
      </div>
    </div>
  );
};

export const ContentShimmer = () => {
  return (
    <div className="flex  flex-col md:flex-row md:mt-10 p-4 gap-4">
      <div className="flex flex-col flex-grow gap-2">
        <div className="w-[70px] h-3 bg-gray-200 rounded-md" />
        {/* Título de carga */}
        <div className="md:w-2/12 h-4 bg-gray-200 rounded-md" />
        <div className="md:w-6/12 h-4 bg-gray-200 rounded-md" />
        <div className="md:w-4/12 h-4 bg-gray-200 rounded-md" />

        <div className="md:w-7/12 h-4 bg-gray-200 rounded-md" />

        <div className="md:w-10/12 h-4 bg-gray-200 rounded-md mt-4" />
        <div className="md:w-6/12 h-4 bg-gray-200 rounded-md" />
        <div className="md:w-4/12 h-4 bg-gray-200 rounded-md" />

        <div className="md:w-7/12 h-4 bg-gray-200 rounded-md" />
      </div>
      <div className="flex">
        <div className="w-96  h-72 bg-gray-200 rounded-md" />
      </div>
    </div>
  );
};
