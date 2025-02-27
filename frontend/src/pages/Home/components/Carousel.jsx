import React, { useEffect, useState } from "react";

const Carousel = ({ images, intervalTime = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Auto Slide Effect
  useEffect(() => {
    const interval = setInterval(nextSlide, intervalTime);
    return () => clearInterval(interval);
  }, [currentIndex, intervalTime]);

  return (
    <div className="flex justify-center">
      <div className="relative w-full md:w-[90%] lg:w-[90%] xl:w-[1200px] overflow-hidden rounded-md">
        {/* Carousel Wrapper */}
        <div
          className="flex transition-transform duration-1500 will-change-transform ease-in-out rounded-md"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Slide ${index + 1}`}
              className="w-full flex-shrink-0 rounded-md h-48 sm:h-64 md:h-80 lg:h-96 xl:h-[500px] object-cover"
            />
          ))}
        </div>

        {/* Slider Controls */}
        <button
          className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black/50 p-1 md:p-2 rounded-full text-white text-sm md:text-md cursor-pointer"
          onClick={prevSlide}
        >
          ❮
        </button>
        <button
          className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black/50 p-1 md:p-2 rounded-full text-white text-sm md:text-md cursor-pointer"
          onClick={nextSlide}
        >
          ❯
        </button>
      </div>
    </div>
  );
};

export default Carousel;
