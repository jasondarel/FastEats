import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaTimes, FaSmile } from "react-icons/fa";

const GifPicker = ({ isOpen, onClose, onGifSelect, onToggle }) => {
  const [gifs, setGifs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("trending");
  const searchTimeoutRef = useRef(null);
  const pickerRef = useRef(null);

  //API key from https://developers.giphy.com/
  const GIPHY_API_KEY = "hpAoUTDz3DFSKlT2SxZjccBjhs9IvGqD";
  const GIPHY_BASE_URL = "https://api.giphy.com/v1/gifs";

  const categories = [
    { id: "trending", label: "Trending", emoji: "🔥" },
    { id: "reactions", label: "Reactions", emoji: "😄" },
    { id: "hello", label: "Hello", emoji: "👋" },
    { id: "thank you", label: "Thanks", emoji: "🙏" },
    { id: "congratulations", label: "Congrats", emoji: "🎉" },
    { id: "love", label: "Love", emoji: "❤️" },
  ];

  const fetchGifs = async (query = "", category = "trending") => {
    if (!GIPHY_API_KEY) {
      setError("Giphy API key not configured");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let url;
      if (query.trim()) {
        url = `${GIPHY_BASE_URL}/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(
          query
        )}&limit=20&rating=g`;
      } else if (category === "trending") {
        url = `${GIPHY_BASE_URL}/trending?api_key=${GIPHY_API_KEY}&limit=20&rating=g`;
      } else {
        url = `${GIPHY_BASE_URL}/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(
          category
        )}&limit=20&rating=g`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setGifs(data.data || []);
      } else {
        setError("Failed to fetch GIFs");
      }
    } catch (err) {
      setError("Error fetching GIFs: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchGifs(value);
    }, 500);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSearchTerm("");
    fetchGifs("", category);
  };

  const handleGifClick = (gif) => {
    const gifData = {
      id: gif.id,
      url: gif.images.fixed_height.url,
      title: gif.title,
      width: gif.images.fixed_height.width,
      height: gif.images.fixed_height.height,
    };
    onGifSelect(gifData);
    onClose();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      fetchGifs();
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
      <div ref={pickerRef} className="w-full max-w-md mx-auto">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold text-gray-800">Choose a GIF</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="text-gray-500" size={14} />
          </button>
        </div>

        <div className="p-3 border-b">
          <div className="relative">
            <FaSearch
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={14}
            />
            <input
              type="text"
              placeholder="Search for GIFs..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
            />
          </div>
        </div>

        {!searchTerm && (
          <div className="p-3 border-b">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    selectedCategory === category.id
                      ? "bg-yellow-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <span className="mr-1">{category.emoji}</span>
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 text-center text-red-500 text-sm">
            {error}
            {error.includes("API key") && (
              <div className="mt-2 text-xs text-gray-500">
                Get a free API key from{" "}
                <a
                  href="https://developers.giphy.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  Giphy Developers
                </a>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500 mx-auto mb-2"></div>
            <p className="text-gray-500 text-sm">Loading GIFs...</p>
          </div>
        )}

        {!loading && !error && gifs.length > 0 && (
          <div className="max-h-64 overflow-y-auto p-3">
            <div className="grid grid-cols-2 gap-2">
              {gifs.map((gif) => (
                <button
                  key={gif.id}
                  onClick={() => handleGifClick(gif)}
                  className="relative overflow-hidden rounded-lg hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <img
                    src={gif.images.fixed_width_small.url}
                    alt={gif.title}
                    className="w-full h-24 object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {!loading && !error && gifs.length === 0 && searchTerm && (
          <div className="p-6 text-center">
            <FaSmile className="text-gray-300 text-2xl mx-auto mb-2" />
            <p className="text-gray-500 text-sm">
              No GIFs found for "{searchTerm}"
            </p>
          </div>
        )}

        <div className="p-2 border-t text-center">
          <p className="text-xs text-gray-500">
            Powered by{" "}
            <a
              href="https://giphy.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              GIPHY
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default GifPicker;
