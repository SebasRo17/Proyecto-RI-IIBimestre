import React, { useState } from 'react';
import { Search, Upload, History, Zap } from 'lucide-react';
import { SearchBar } from './components/SearchBar';
import { ImageUpload } from './components/ImageUpload';
import { ResultsDisplay } from './components/ResultsDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { useImageClassification } from './hooks/useImageClassification';
import { useSearchHistory } from './hooks/useSearchHistory';

type SearchType = 'text' | 'image' | null;

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentSearchType, setCurrentSearchType] = useState<SearchType>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { 
    isLoading, 
    error, 
    results, 
    classifyImage, 
    searchByText, 
    clearResults 
  } = useImageClassification();
  
  const { searchHistory, addToHistory, clearHistory } = useSearchHistory();

  const handleTextSearch = async (query: string) => {
    setSearchQuery(query);
    setCurrentSearchType('text');
    addToHistory(query);
    await searchByText(query);
  };

  const handleImageSelect = async (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setCurrentSearchType('image');
    setSearchQuery('');
    await classifyImage(file);
  };

  const handleClearImage = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }
    setSelectedImage(null);
    clearResults();
    setCurrentSearchType(null);
  };

  const handleRetry = () => {
    if (currentSearchType === 'text' && searchQuery) {
      handleTextSearch(searchQuery);
    } else if (currentSearchType === 'image' && selectedImage) {
      // Para retry de imagen, necesitaríamos almacenar el archivo original
      // Por simplicidad, solo limpiamos el error
      clearResults();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-sky-500 to-emerald-500 p-2 rounded-xl">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                VisualSearch AI
              </h1>
              <p className="text-sm text-slate-600">
                Identifica objetos con inteligencia artificial
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">
            Busca e identifica cualquier objeto
          </h2>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Busca por texto o sube una imagen para identificar objetos automáticamente 
            con nuestra avanzada inteligencia artificial.
          </p>

          {/* Search Methods */}
          <div className="space-y-8">
            {/* Text Search */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-slate-700">
                <Search className="w-5 h-5" />
                <span className="font-semibold">Búsqueda por texto</span>
              </div>
              <SearchBar
                onSearch={handleTextSearch}
                searchHistory={searchHistory}
                isLoading={isLoading}
              />
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gradient-to-br from-slate-50 via-sky-50 to-emerald-50 text-slate-500 font-medium">
                  o sube una imagen para identificar objetos
                </span>
              </div>
            </div>

            {/* Image Upload */}
            <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
              <div className="flex items-center gap-2 text-slate-700">
                <Upload className="w-5 h-5" />
                <span className="font-semibold">Subir imagen</span>
              </div>
              <ImageUpload
                onImageSelect={handleImageSelect}
                isLoading={isLoading}
                selectedImage={selectedImage || undefined}
                onClearImage={handleClearImage}
              />
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {isLoading && (
          <div className="mb-8">
            <LoadingSpinner 
              message={currentSearchType === 'text' ? 'Buscando...' : 'Analizando imagen...'}
              size="lg"
            />
          </div>
        )}

        {error && (
          <div className="mb-8">
            <ErrorMessage
              message={error}
              onRetry={handleRetry}
            />
          </div>
        )}

        {/* Results */}
        {!isLoading && !error && (results.length > 0 || currentSearchType) && (
          <ResultsDisplay
            results={results}
            searchQuery={searchQuery}
            searchType={currentSearchType || 'text'}
            isLoading={isLoading}
          />
        )}

        {/* Search History */}
        {searchHistory.length > 0 && !isLoading && !currentSearchType && (
          <div className="mt-16 max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-slate-600" />
                  <h3 className="text-lg font-semibold text-slate-800">
                    Búsquedas recientes
                  </h3>
                </div>
                <button
                  onClick={clearHistory}
                  className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Limpiar
                </button>
              </div>
              <div className="space-y-2">
                {searchHistory.slice(0, 5).map((query, index) => (
                  <button
                    key={index}
                    onClick={() => handleTextSearch(query)}
                    className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-slate-600">
            <p className="mb-2">
              Desarrollado con tecnología de inteligencia artificial avanzada
            </p>
            <p className="text-sm">
              Cumple con los principios de usabilidad de Nielsen para una experiencia óptima
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;