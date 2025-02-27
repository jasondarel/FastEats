import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const RotatingText = ({
  texts = [],
  mainClassName = "",
  staggerFrom = "last",
  initial = { y: "100%" },
  animate = { y: 0 },
  exit = { y: "-120%" },
  staggerDuration = 0.025,
  splitLevelClassName = "",
  transition = { type: "spring", damping: 30, stiffness: 400 },
  rotationInterval = 2000,
}) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  useEffect(() => {
    // Set up interval to rotate through texts
    const intervalId = setInterval(() => {
      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
    }, rotationInterval);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [texts.length, rotationInterval]);

  const currentText = texts[currentTextIndex];

  return (
    <div className={mainClassName}>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentTextIndex}
          className="inline-block"
          initial={initial}
          animate={animate}
          exit={exit}
          transition={transition}
        >
          {currentText}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

export default RotatingText;
