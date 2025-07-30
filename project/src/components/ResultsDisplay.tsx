import React from 'react';

interface ClassificationResult {
  imageName: string;
  caption: string
}

interface ResultsDisplayProps {
  results: ClassificationResult[];
  searchQuery: string;
  searchType: 'text' | 'image';
  isLoading: boolean;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  results,
  searchQuery,
  searchType,
  isLoading,
}) => {

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
              <div className="w-full h-48 bg-slate-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-3 bg-slate-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto text-center py-12">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-semibold text-slate-700 mb-2">
            No se encontraron resultados
          </h3>
          <p className="text-slate-500">
            {searchType === 'text'
              ? `No hay resultados para "${searchQuery}". Intenta con otros términos.`
              : 'No se pudieron identificar imágenes similares. Intenta con otra imagen.'}
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Resultados {searchType === 'text' ? 'de búsqueda' : 'de imagen'}
        </h2>
        <p className="text-slate-600">
          {searchType === 'text'
            ? `${results.length} resultados para "${searchQuery}"`
            : `${results.length} imágenes similares encontradas`}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((result, index) => (
          <div
            key={result.imageName || index}
            className="bg-white rounded-xl shadow-lg flex flex-col items-center overflow-hidden p-4"
          >
            <img
              src={`http://localhost:8000/dataset-images/${result.imageName}`}
              alt={result.caption}
              className="w-48 h-48 object-cover rounded-lg shadow"
            />
            <span className="mt-2 text-slate-700 text-sm font-medium">
              {result.imageName}
            </span>
            <p className="mt-1 text-slate-500 text-xs text-center">
              {result.caption}
            </p>
          </div>
        ))}

      </div>
    </div>
  );
};
