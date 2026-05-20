import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

export const SearchBar = ({ onSearch, onFilter, placeholder = 'Search...' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    date: 'all',
    sortBy: 'newest'
  });

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    setFilters({ status: 'all', date: 'all', sortBy: 'newest' });
    onFilter({ status: 'all', date: 'all', sortBy: 'newest' });
  };

  return (
    <div className="w-full">
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="p-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Filter className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {showFilters && (
        <div className="mt-3 p-4 bg-gray-800 border border-gray-700 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
              <select
                value={filters.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
          <button
            onClick={clearFilters}
            className="mt-3 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
