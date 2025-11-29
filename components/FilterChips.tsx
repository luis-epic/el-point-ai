import React from 'react';

interface FilterChipsProps {
  filters: string[];
  activeFilter: string;
  onSelect: (filter: string) => void;
}

const FilterChips: React.FC<FilterChipsProps> = ({ filters, activeFilter, onSelect }) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2 bg-white/50 backdrop-blur-sm border-b border-gray-100">
      <div className="flex px-4 space-x-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => onSelect(filter)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              activeFilter === filter
                ? 'bg-brand-600 text-white shadow-md shadow-brand-200 transform scale-105'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterChips;