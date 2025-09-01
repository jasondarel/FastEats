/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Star, User, MessageSquare, ChefHat, Filter } from 'lucide-react';
import { getRestaurantRatingService } from '../services/ratingService';

const RestaurantRating = ({ restaurantId, menuId }) => {
  const [ratings, setRatings] = useState([]);
  const [filteredRatings, setFilteredRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [selectedStarFilter, setSelectedStarFilter] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  useEffect(() => {
    const fetchRatings = async () => {
      if (!restaurantId) return;
      
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Authentication required');
          return;
        }
        
        const data = await getRestaurantRatingService(restaurantId, token);
        console.log('Fetched ratings:', data);
        
        if (data.success && data.data) {
          setRatings(data.data.ratings || []);
          setAverageRating(data.data.averageRating || 0);
        } else {
          setError(data.message || 'Failed to fetch ratings');
        }
      } catch (err) {
        console.error('Error fetching ratings:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, [restaurantId]);

  
  useEffect(() => {
    if (!menuId || !ratings.length) {
      setFilteredRatings(ratings);
      return;
    }

    const filtered = ratings.filter(rating => {
      
      const targetMenuId = parseInt(menuId);
      
      
      if (rating.menu_id && parseInt(rating.menu_id) === targetMenuId) {
        console.log('Direct menu_id match:', rating);
        return true;
      }
      
      
      if (rating.order_items && rating.order_items.length > 0) {
        const hasMatchingItem = rating.order_items.some(item => 
          (item.menu_id && parseInt(item.menu_id) === targetMenuId) ||
          (item.id && parseInt(item.id) === targetMenuId)
        );
        if (hasMatchingItem) {
          console.log('Order items match:', rating);
        }
        return hasMatchingItem;
      }
      
      return false;
    });

    console.log('Filtered ratings:', filtered);
    setFilteredRatings(filtered);

    if (filtered.length > 0) {
      const sum = filtered.reduce((acc, rating) => acc + rating.rating, 0);
      setAverageRating(sum / filtered.length);
    } else {
      setAverageRating(0);
    }
  }, [ratings, menuId]);

  // Apply star rating filter
  const starFilteredRatings = selectedStarFilter === 'all' 
    ? filteredRatings 
    : filteredRatings.filter(rating => rating.rating === parseInt(selectedStarFilter));

  const renderStars = (rating, size = 'w-4 h-4') => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStarFilterCounts = () => {
    const counts = { all: filteredRatings.length };
    for (let i = 1; i <= 5; i++) {
      counts[i] = filteredRatings.filter(rating => rating.rating === i).length;
    }
    return counts;
  };

  const starCounts = getStarFilterCounts();
  const displayedReviews = showAllReviews ? starFilteredRatings : starFilteredRatings.slice(0, 3);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border-b pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" />
          {menuId ? 'Menu Item Reviews' : 'Customer Reviews'}
        </h3>
        <div className="text-center text-gray-500 py-4">
          <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>Unable to load reviews at this time.</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!filteredRatings || filteredRatings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" />
          {menuId ? 'Menu Item Reviews' : 'Customer Reviews'}
        </h3>
        <div className="text-center text-gray-500 py-8">
          <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>{menuId ? 'No reviews for this menu item yet.' : 'No reviews yet.'}</p>
          <p className="text-sm">
            {menuId 
              ? 'Be the first to review this dish!' 
              : 'Be the first to review this restaurant!'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" />
          {menuId ? 'Menu Item Reviews' : 'Customer Reviews'}
        </h3>
        <div className="flex items-center gap-2">
          {renderStars(Math.round(averageRating), 'w-5 h-5')}
          <span className="text-lg font-semibold text-gray-900">
            {averageRating.toFixed(1)}
          </span>
          <span className="text-gray-500">
            ({filteredRatings.length} review{filteredRatings.length !== 1 ? 's' : ''})
          </span>
        </div>
      </div>

      {/* Star Rating Filter */}
      <div className="mb-6">
        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="hover:cursor-pointer flex items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
          >
            <Filter className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-700">
              {selectedStarFilter === 'all' 
                ? 'All Ratings' 
                : `${selectedStarFilter} Star${selectedStarFilter !== '1' ? 's' : ''}`
              }
            </span>
            <span className="text-xs text-amber-700 bg-amber-200 px-2 py-1 rounded-full">
              {starFilteredRatings.length}
            </span>
          </button>

          {showFilterDropdown && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <div className="p-2">
                <button
                  onClick={() => {
                    setSelectedStarFilter('all');
                    setShowFilterDropdown(false);
                    setShowAllReviews(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                    selectedStarFilter === 'all' 
                      ? 'bg-yellow-50 text-yellow-700' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span>All Ratings</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {starCounts.all}
                  </span>
                </button>
                
                {[5, 4, 3, 2, 1].map((stars) => (
                  <button
                    key={stars}
                    onClick={() => {
                      setSelectedStarFilter(stars.toString());
                      setShowFilterDropdown(false);
                      setShowAllReviews(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors hover:cursor-pointer ${
                      selectedStarFilter === stars.toString()
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 ">
                      {renderStars(stars, 'w-3 h-3')}
                      <span>{stars} Star{stars !== 1 ? 's' : ''}</span>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {starCounts[stars]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {displayedReviews.map((rating, index) => (
          <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {rating.profilePhoto || rating.user?.profile_photo ? (
                  <img
                    src={rating.profilePhoto || rating.user.profile_photo}
                    alt={rating.name || rating.user?.name || 'User'}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900 truncate">
                      {rating.name || rating.user?.name || 'Anonymous User'}
                    </h4>
                    {rating.order_quantity > 1 && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full flex items-center gap-1">
                        <ChefHat className="w-3 h-3" />
                        {rating.order_quantity} items
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(rating.created_at)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(rating.rating)}
                  <span className="text-sm font-medium text-gray-700">
                    {rating.rating}/5
                  </span>
                </div>
                
                {rating.comment && (
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {rating.comment}
                  </p>
                )}
                
               
              </div>
            </div>
          </div>
        ))}
      </div>

      {starFilteredRatings.length === 0 && selectedStarFilter !== 'all' && (
        <div className="text-center text-gray-500 py-8">
          <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No {selectedStarFilter} star reviews found.</p>
          <button
            onClick={() => {
              setSelectedStarFilter('all');
              setShowAllReviews(false);
            }}
            className="text-yellow-600 hover:text-yellow-700 text-sm mt-2"
          >
            Show all reviews
          </button>
        </div>
      )}

      {starFilteredRatings.length > 3 && (
        <div className="text-center mt-4">
          <button
            onClick={() => setShowAllReviews(!showAllReviews)}
            className="text-yellow-600 hover:text-yellow-700 font-medium text-sm transition-colors"
          >
            {showAllReviews 
              ? 'Show Less Reviews' 
              : `Show All ${starFilteredRatings.length} Reviews`
            }
          </button>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {showFilterDropdown && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowFilterDropdown(false)}
        />
      )}
    </div>
  );
};

export default RestaurantRating;