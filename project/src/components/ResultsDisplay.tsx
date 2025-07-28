import React from 'react';
import { Eye, Download, Share2, AlertCircle } from 'lucide-react';

interface ClassificationResult {
  id: string;
  object: string;
  confidence: number;
  category: string;
  description: string;
  imageUrl: string;
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
  isLoading 
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

  if (results.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto text-center py-12">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">
            No se encontraron resultados
          </h3>
          <p className="text-slate-500">
            {searchType === 'text' 
              ? `No hay resultados para "${searchQuery}". Intenta con otros términos.`
              : 'No se pudieron identificar objetos en la imagen. Intenta con otra imagen más clara.'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Resultados {searchType === 'text' ? 'de búsqueda' : 'de clasificación'}
        </h2>
        <p className="text-slate-600">
          {searchType === 'text' 
            ? `${results.length} resultados para "${searchQuery}"`
            : `${results.length} objetos identificados en la imagen`
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((result) => (
          <div key={result.id} className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="relative overflow-hidden">
              <img
                src={result.imageUrl}
                alt={result.object}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
              
              {searchType === 'image' && (
                <div className="absolute top-3 right-3">
                  <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-sm font-semibold text-slate-700">
                      {Math.round(result.confidence * 100)}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-1">
                    {result.object}
                  </h3>
                  <span className="inline-block bg-sky-100 text-sky-700 text-xs font-medium px-2 py-1 rounded-full">
                    {result.category}
                  </span>
                </div>
              </div>

              <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                {result.description}
              </p>

              <div className="flex items-center gap-2">
                <button className="flex-1 bg-sky-500 hover:bg-sky-600 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-medium">
                  <Eye className="w-4 h-4" />
                  Ver detalles
                </button>
                <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};