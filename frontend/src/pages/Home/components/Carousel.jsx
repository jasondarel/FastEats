import React, { useEffect, useState } from "react";

const Carousel = ({ images, intervalTime = 3000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const itemsToShow = 3;
  // Maximum index we can scroll to (so we always show 3 items)
  const maxIndex = Math.max(0, images.length - itemsToShow);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex >= maxIndex) {
        return 0; // Loop back to start
      }
      return prevIndex + 1; // Move one position
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex <= 0) {
        return maxIndex; // Go to last valid position
      }
      return prevIndex - 1; // Move back one position
    });
  };

  // Auto slide effect
  useEffect(() => {
    if (images.length <= itemsToShow) return;

    const interval = setInterval(nextSlide, intervalTime);
    return () => clearInterval(interval);
  }, [currentIndex, intervalTime, images.length, itemsToShow, maxIndex]);

  // If we don't have enough images, just show them all without sliding
  if (images.length <= itemsToShow) {
    return (
      <div className="flex justify-center mb-6">
        <div className="w-full max-w-6xl">
          <div className="flex gap-4 justify-center">
            {images.map((image, index) => (
              <div key={index} className="flex-1 max-w-md">
                <img
                  src={image}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-56 sm:h-64 md:h-72 object-cover rounded-lg shadow-lg"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center mb-6">
      <div className="relative w-full max-w-6xl overflow-hidden">
        {/* Carousel Container */}
        <div className="relative">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateX(-${
                currentIndex * (100 / images.length)
              }%)`,
              width: `${(images.length * 100) / itemsToShow}%`,
            }}
          >
            {images.map((image, index) => (
              <div
                key={index}
                className="px-2"
                style={{ width: `${100 / itemsToShow}%` }}
              >
                <img
                  src={image}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-56 sm:h-64 md:h-72 object-cover rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <button
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 p-3 rounded-full text-white text-xl cursor-pointer transition-all duration-200 shadow-lg hover:scale-110 z-10"
          onClick={prevSlide}
          aria-label="Previous slide"
        >
          ❮
        </button>
        <button
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 p-3 rounded-full text-white text-xl cursor-pointer transition-all duration-200 shadow-lg hover:scale-110 z-10"
          onClick={nextSlide}
          aria-label="Next slide"
        >
          ❯
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-white scale-125"
                  : "bg-white/60 hover:bg-white/80"
              }`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Carousel;
