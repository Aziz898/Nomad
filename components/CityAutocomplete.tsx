import React, { useState, useEffect, useRef } from 'react';
import { getCitySuggestions } from '../services/mockExternalApis';
import { Loader2 } from 'lucide-react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  className?: string;
}

export const CityAutocomplete: React.FC<Props> = ({ value, onChange, placeholder, className }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (value.length >= 2) {
         setIsLoading(true);
         const results = await getCitySuggestions(value);
         setSuggestions(results);
         setIsOpen(results.length > 0);
         setIsLoading(false);
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div ref={wrapperRef} className="relative w-full">
       <input
         type="text"
         value={value}
         onChange={(e) => onChange(e.target.value)}
         placeholder={placeholder}
         className={className}
         onFocus={() => value.length >= 2 && suggestions.length > 0 && setIsOpen(true)}
       />
       
       {/* Loading Spinner */}
       {isLoading && value.length > 2 && (
         <div className="absolute right-2 top-1/2 -translate-y-1/2">
           <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
         </div>
       )}

       {/* Dropdown */}
       {isOpen && suggestions.length > 0 && (
         <ul className="absolute left-0 z-50 w-full bg-white border border-gray-100 rounded-lg shadow-xl mt-2 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 no-scrollbar">
           {suggestions.map((city, idx) => (
             <li
               key={idx}
               onClick={() => {
                 onChange(city);
                 setIsOpen(false);
               }}
               className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-600 cursor-pointer border-b border-gray-50 last:border-0 transition-colors text-left"
             >
               {city}
             </li>
           ))}
         </ul>
       )}
    </div>
  );
};