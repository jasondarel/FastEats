import React from "react";
import RotatingText from "../../../blocks/TextAnimations/RotatingText/RotatingText"; // Updated import path

const WelcomeHeader = ({ username }) => {
  return (
    <>
      <h1 className="flex-col flex items-center justify-center text-xl md:text-2xl lg:text-3xl xl:text-5xl font-bold text-yellow-700 mb-4 mt-5">
        <div className="flex items-end bg-black justify-center min-w-30 md:min-w-40 lg:min-w-50 xl:min-w-70 rounded-xl">
          <RotatingText
            texts={[
              "Hello",
              "¡Hola!",
              "你好",
              "привет",
              "こんにちは",
              "안녕하세요",
              "สวัสดีครับ",
            ]}
            mainClassName="flex items-end px-2 sm:px-2 md:px-3 text-yellow-300 overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
            staggerFrom="last"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-120%" }}
            staggerDuration={0.025}
            splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            rotationInterval={2000}
          />
        </div>
        {username}!
      </h1>

      <div className="flex justify-center items-end mb-6">
        <p className="text-gray-800 text-base md:text-lg font-medium">
          What would you like to eat today?
        </p>
      </div>
    </>
  );
};

export default WelcomeHeader;
