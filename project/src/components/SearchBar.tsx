import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Clock } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  searchHistory: string[];
  isLoading: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, searchHistory, isLoading }) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredHistory, setFilteredHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = searchHistory.filter(item => 
        item.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredHistory(filtered.slice(0, 5));
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [query, searchHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  const clearQuery = () => {
    setQuery('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length > 0 && setShowSuggestions(true)}
            placeholder="Buscar objetos, animales, lugares..."
            className="w-full pl-12 pr-12 py-4 text-lg bg-white border-2 border-slate-200 rounded-2xl focus:border-sky-500 focus:outline-none transition-all duration-200 shadow-lg hover:shadow-xl"
            disabled={isLoading}
          />
          {query && (
            <button
              type="button"
              onClick={clearQuery}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {showSuggestions && filteredHistory.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
            {filteredHistory.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 border-b border-slate-100 last:border-b-0"
              >
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700">{suggestion}</span>
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};