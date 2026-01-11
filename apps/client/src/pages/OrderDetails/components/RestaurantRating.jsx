import React, { useState, useEffect } from "react";
import { API_URL } from "../../../config/api";
import { FaCircleCheck } from "react-icons/fa6";
import { FaRegStar, FaStar } from "react-icons/fa";

const RestaurantRating = ({ order, onSubmitRating }) => {
  console.log("RestaurantRating component rendered with order:", order);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [existingRating, setExistingRating] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkExistingRating = async () => {
      if (!order || !order.order_id || !order.restaurant_id) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${API_URL}/restaurant/rate?orderId=${order.order_id}&restaurantId=${order.restaurant_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Existing rating response:", data);
          if (data.success && data.restaurantRating) {
            setExistingRating(data.restaurantRating);
            setRating(data.restaurantRating.rating);
            setReview(data.restaurantRating.comment || "");
            setHasRated(true);
          }
        } else if (response.status === 404) {
          console.log("No existing rating found - user can rate");
          console.log("Response status:", response.status);
          console.log("Response :", response);
        } else {
          console.error(
            "Error checking existing rating:",
            response.status,
            response.statusText
          );
        }
      } catch (error) {
        console.error("Error checking existing rating:", error);
      } finally {
        setLoading(false);
      }
    };

    checkExistingRating();
  }, [order]);

  const handleStarClick = (starRating) => {
    if (!hasRated) {
      setRating(starRating);
    }
  };

  const handleStarHover = (starRating) => {
    if (!hasRated) {
      setHoverRating(starRating);
    }
  };

  const handleStarLeave = () => {
    if (!hasRated) {
      setHoverRating(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0 || hasRated) return;

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (onSubmitRating) {
        await onSubmitRating({
          rating,
          review,
        });
      }
      setHasRated(true);
      setExistingRating({ rating, review });
    } catch (error) {
      console.error("Error submitting rating:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingText = (rating) => {
    switch (rating) {
      case 1:
        return "Poor";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Very Good";
      case 5:
        return "Excellent";
      default:
        return "Rate your experience";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "";
    }
  };

  if (hasRated) {
    return (
      <div className="w-full bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200 shadow-sm">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
            <FaCircleCheck className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="text-2xl font-semibold text-amber-900 mb-2">
            {existingRating ? "Your Rating" : "Thank you for your feedback!"}
          </h3>
          <p className="text-lg text-amber-700 mb-4">
            {existingRating
              ? `You rated this restaurant on ${formatDate(
                  existingRating.created_at
                )}`
              : "Your rating has been submitted successfully."}
          </p>

          <div className="flex justify-center mb-4">
            {[1, 2, 3, 4, 5].map((star) => {
              const isActive = star <= rating;
              const Icon = isActive ? FaStar : FaRegStar;

              return (
                <Icon
                  key={star}
                  className={`w-6 h-6 ${
                    isActive ? "text-amber-400" : "text-gray-300"
                  } transition-all duration-300`}
                />
              );
            })}
          </div>

          <div className="text-center">
            <span className="text-lg font-medium text-amber-800">
              {getRatingText(rating)}
            </span>
          </div>

          {review && (
            <div className="mt-4 p-4 bg-white/60 rounded-lg border border-amber-100">
              <p className="text-sm font-medium text-amber-800 mb-2">
                Your Review:
              </p>
              <p className="text-amber-700 italic">"{review}"</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200 shadow-sm animate-fadeIn">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-semibold text-amber-900 mb-2">
          Rate Your Experience
        </h3>
        <p className="text-lg text-amber-700">
          How was your order from {order?.restaurant?.restaurant_name}?
        </p>
      </div>

      <div className="space-y-6">
        <div className="text-center">
          <div className="flex justify-center gap-2 mb-3">
            {[1, 2, 3, 4, 5].map((star) => {
              const isActive = star <= (hoverRating || rating);
              const Icon = isActive ? FaStar : FaRegStar;

              return (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none transition-all duration-200 hover:scale-110 active:scale-95 hover:cursor-pointer"
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleStarHover(star)}
                  onMouseLeave={handleStarLeave}
                >
                  <Icon
                    className={`w-10 h-10 transition-all duration-300 ${
                      isActive
                        ? "text-amber-400 drop-shadow-sm"
                        : "text-gray-300 hover:text-amber-200"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <div className="min-h-[24px]">
            <p
              className={`text-lg font-medium transition-all duration-300 ${
                hoverRating || rating
                  ? "text-amber-800 scale-105"
                  : "text-amber-600"
              }`}
            >
              {getRatingText(hoverRating || rating)}
            </p>
          </div>
        </div>

        <div className="space-y-2 max-w-2xl mx-auto">
          <label
            htmlFor="review"
            className="block text-base font-medium text-amber-800"
          >
            Share your thoughts (optional)
          </label>
          <textarea
            id="review"
            rows={4}
            className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none transition-all duration-200 placeholder-amber-400 bg-white/80 backdrop-blur-sm text-base focus:outline-none"
            placeholder="Tell us about your experience with the food, delivery, and service..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            disabled={rating === 0 || isSubmitting}
            onClick={handleSubmit}
            className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:cursor-pointer transform ${
              rating === 0 || isSubmitting
                ? "bg-gray-400 cursor-not-allowed scale-95"
                : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 hover:scale-105 shadow-lg hover:shadow-xl active:scale-95"
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <FaRegStar />
                Submitting...
              </div>
            ) : (
              "Submit Rating"
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default RestaurantRating;
