/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import { Link } from "react-router-dom";

const AuthLink = ({ text, linkText, to }) => {
  return (
    <div>
      {" "}
      <p className="mt-4 text-center">
        {text}{" "}
        <Link
          to={to}
          className="text-yellow-500 underline hover:text-yellow-600"
        >
          {linkText}
        </Link>
      </p>
      <p className="mt-4 text-center">
        <Link
          to="/about"
          className="text-yellow-500 underline hover:text-yellow-600"
        >
          About Us
        </Link>
      </p>
    </div>
  );
};

export default AuthLink;
