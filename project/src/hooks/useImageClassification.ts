import { useState, useCallback } from 'react';

export interface ClassificationResult {
  imageName: string; // Solo el nombre de la imagen, por ejemplo: "cat.jpg"
}

export const useImageClassification = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ClassificationResult[]>([]);

  // Buscar por texto
  const searchByText = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    setResults([]);
    try {
      const formData = new URLSearchParams();
      formData.append('texto', query);

      const response = await fetch('http://localhost:8000/buscar_por_texto', {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const data = await response.json();
      if (data.resultados) {
        setResults(data.resultados.map((imgName: string) => ({
          imageName: imgName
        })));
      } else {
        setError('No se encontraron resultados.');
      }
    } catch (err) {
      setError('Ocurrió un error en la búsqueda por texto.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Buscar por imagen
  const classifyImage = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setResults([]);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/buscar_por_imagen', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.resultados) {
        setResults(data.resultados.map((imgName: string) => ({
          imageName: imgName
        })));
      } else {
        setError('No se encontraron resultados.');
      }
    } catch (err) {
      setError('Ocurrió un error al analizar la imagen.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    results,
    classifyImage,
    searchByText,
    clearResults
  };
};
