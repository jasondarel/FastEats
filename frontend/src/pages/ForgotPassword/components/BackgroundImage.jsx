/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from "react";

const BackgroundImage = ({ imagePath }) => {
  return (
    <div
      className="absolute inset-0 w-full h-full bg-gray-900 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url('${imagePath}')` }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gray-900/75"></div>
    </div>
  );
};

export default BackgroundImage;
