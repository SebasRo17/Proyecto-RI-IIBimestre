import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  type?: 'error' | 'warning';
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onRetry, 
  type = 'error' 
}) => {
  const bgColor = type === 'error' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200';
  const textColor = type === 'error' ? 'text-red-700' : 'text-amber-700';
  const iconColor = type === 'error' ? 'text-red-500' : 'text-amber-500';
  const buttonColor = type === 'error' 
    ? 'bg-red-500 hover:bg-red-600' 
    : 'bg-amber-500 hover:bg-amber-600';

  return (
    <div className={`${bgColor} border rounded-xl p-6 max-w-md mx-auto`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <h3 className={`font-semibold ${textColor} mb-1`}>
            {type === 'error' ? 'Error' : 'Advertencia'}
          </h3>
          <p className={`text-sm ${textColor} mb-4`}>{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className={`${buttonColor} text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors`}
            >
              <RefreshCw className="w-4 h-4" />
              Intentar nuevamente
            </button>
          )}
        </div>
      </div>
    </div>
  );
};