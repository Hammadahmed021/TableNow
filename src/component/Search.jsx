import React, { useState } from "react";
import { LuSearch } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

const Search = ({ data, className }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  // Function to handle search input change
  const handleSearch = (value) => {
    setSearchTerm(value);
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }
    const filteredSuggestions = data.filter((item) =>
      item.restaurant_name.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(filteredSuggestions);
  };

  // Function to navigate to the selected card
  const navigateToCard = (id) => {
    navigate(`/restaurant/${id}`); // Navigate to restaurant detail page
    setSearchTerm(""); // Clear search input after navigation
    setSuggestions([]); // Clear suggestions after navigation
  };

  return (
    <>
      
        <span className={`sm:ml-5 ml-0 py-2 w-full border outline-none focus:bg-gray-50 bg-white text-black rounded-lg duration-200 border-gray-200 flex shadow-md ${className}`}>
          <input
            type="text"
            placeholder={"Search Restaurants by Name.."}
            className={`px-2 w-full outline-none`}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
          />
         
          <LuSearch
            size={24}
            className="bg-tn_pink mr-2 rounded-full w-8 h-8 py-1 px-2 text-white"
            onClick={() => handleSearch(searchTerm)}
          />
        </span>
        {suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-12 mt-1 bg-white border border-gray-300 shadow-md rounded-lg z-10">
            {suggestions.map((item) => (
              <div
                key={item.id}
                className="p-2 cursor-pointer hover:bg-gray-100"
                onClick={() => navigateToCard(item.id)}
              >
                {item.restaurant_name}
              </div>
            ))}
          </div>
        )}
    </>
  );
};

export default Search;
