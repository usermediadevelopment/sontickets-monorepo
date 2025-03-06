export const CardShimmer = () => (
  <div className="p-4 border rounded-lg shadow-lg bg-white animate-pulse space-y-4">
    {/* Imagen de carga */}
    <div className="w-full h-32 bg-gray-200 rounded-md" />
    {/* Título de carga */}
    <div className="h-4 bg-gray-200 rounded w-3/4" />
    {/* Subtítulo de carga */}
    <div className="h-4 bg-gray-200 rounded w-1/2" />
    {/* Línea extra para descripción */}
    <div className="h-4 bg-gray-200 rounded w-full" />
  </div>
);
