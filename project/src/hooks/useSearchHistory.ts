import { useState, useCallback, useEffect } from 'react';

export const useSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Cargar historial del localStorage al inicializar
  useEffect(() => {
    const saved = localStorage.getItem('searchHistory');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch {
        // Ignorar errores de parsing
      }
    }
  }, []);

  // Guardar historial en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);

  const addToHistory = useCallback((query: string) => {
    setSearchHistory(prev => {
      // Remover duplicados y agregar al principio
      const filtered = prev.filter(item => item !== query);
      const newHistory = [query, ...filtered];
      // Mantener solo los últimos 10 elementos
      return newHistory.slice(0, 10);
    });
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  }, []);

  return {
    searchHistory,
    addToHistory,
    clearHistory
  };
};