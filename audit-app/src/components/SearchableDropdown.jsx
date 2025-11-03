import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

export const SearchableDropdown = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Find the selected option object to display its label
  const selectedOption = options.find(option => option.value === value);

  // Filter options based on search term
  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm(''); // Clear search on close
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (option) => {
    onChange(option.value); // Pass the value (e.g., "Duplicate Work")
    setIsOpen(false);
    setSearchTerm(''); // Clear search on select
  };

  const clearSelection = (e) => {
    e.stopPropagation(); // Stop click from opening/closing dropdown
    onChange(''); // Pass an empty string
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* 1. The Input Box */}
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm transition 
                   dark:bg-slate-700 dark:border-slate-600 dark:text-white
                   flex items-center justify-between cursor-pointer"
      >
        {/* Display selected value or placeholder */}
        <span className={selectedOption ? 'text-slate-900 dark:text-white' : 'text-slate-400'}>
          {selectedOption ? `${selectedOption.code} - ${selectedOption.label}` : placeholder}
        </span>

        {/* Icons (Clear / Dropdown Arrow) */}
        <div className="flex items-center">
          {selectedOption && (
            <button
              type="button"
              onClick={clearSelection}
              className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"
              title="Clear selection"
            >
              <X size={16} className="text-slate-500 dark:text-slate-400" />
            </button>
          )}
          <ChevronDown 
            size={20} 
            className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </div>

      {/* 2. The Dropdown List */}
      {isOpen && (
        <div 
          className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-md shadow-lg 
                     dark:bg-slate-800 dark:border-slate-600"
        >
          {/* Search Bar */}
          <div className="p-2 border-b border-slate-200 dark:border-slate-700">
            <input
              type="text"
              placeholder="Search errors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md 
                         dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              autoFocus
            />
          </div>

          {/* Options List --- THIS IS THE UPDATED LINE --- */}
          <ul 
            className="max-h-96 overflow-y-auto p-1" // <-- Changed from max-h-60 to max-h-96
            // Simple custom scrollbar for Webkit browsers (Chrome, Safari)
            style={{ scrollbarWidth: 'thin' }} 
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <li
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className="px-3 py-2 rounded-md cursor-pointer
                             hover:bg-indigo-100 hover:text-indigo-700
                             dark:hover:bg-indigo-900 dark:hover:text-indigo-100
                             text-slate-800 dark:text-slate-200"
                >
                  <span className="font-bold">{option.code}</span> - {option.label}
                  <span className="text-sm text-slate-500 ml-2">{option.points}</span>
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-slate-500 text-center">No errors found.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;