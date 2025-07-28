import { useState, useCallback } from 'react';

interface ClassificationResult {
  id: string;
  object: string;
  confidence: number;
  category: string;
  description: string;
  imageUrl: string;
}

// Datos simulados para la demostración
const mockResults: ClassificationResult[] = [
  {
    id: '1',
    object: 'Gato Doméstico',
    confidence: 0.94,
    category: 'Animales',
    description: 'Felino doméstico común con pelaje atigrado. Los gatos son mascotas populares conocidas por su independencia y agilidad.',
    imageUrl: 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '2',
    object: 'Perro Golden Retriever',
    confidence: 0.89,
    category: 'Animales',
    description: 'Raza de perro de tamaño mediano a grande, conocida por su temperamento amigable y pelaje dorado.',
    imageUrl: 'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '3',
    object: 'Automóvil Sedan',
    confidence: 0.87,
    category: 'Vehículos',
    description: 'Vehículo de pasajeros con cuatro puertas y compartimento separado para equipaje.',
    imageUrl: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '4',
    object: 'Manzana Roja',
    confidence: 0.92,
    category: 'Frutas',
    description: 'Fruta comestible del manzano, rica en fibra y vitaminas. Popular como snack saludable.',
    imageUrl: 'https://images.pexels.com/photos/1510392/pexels-photo-1510392.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '5',
    object: 'Edificio Moderno',
    confidence: 0.85,
    category: 'Arquitectura',
    description: 'Estructura arquitectónica contemporánea con diseño de cristal y acero.',
    imageUrl: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '6',
    object: 'Árbol de Roble',
    confidence: 0.88,
    category: 'Naturaleza',
    description: 'Árbol caducifolio de gran tamaño, conocido por su longevidad y madera resistente.',
    imageUrl: 'https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
];

export const useImageClassification = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ClassificationResult[]>([]);

  const classifyImage = useCallback(async (imageData: string | File) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simular llamada a API de clasificación
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular resultados aleatorios
      const shuffled = [...mockResults].sort(() => 0.5 - Math.random());
      const randomResults = shuffled.slice(0, Math.floor(Math.random() * 4) + 3);
      
      setResults(randomResults);
    } catch (err) {
      setError('Error al clasificar la imagen. Por favor, intenta nuevamente.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchByText = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simular búsqueda por texto
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Filtrar resultados basados en la consulta
      const filtered = mockResults.filter(item => 
        item.object.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      );

      if (filtered.length === 0) {
        // Si no hay coincidencias exactas, mostrar resultados aleatorios
        const shuffled = [...mockResults].sort(() => 0.5 - Math.random());
        setResults(shuffled.slice(0, 3));
      } else {
        setResults(filtered);
      }
    } catch (err) {
      setError('Error en la búsqueda. Por favor, intenta nuevamente.');
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