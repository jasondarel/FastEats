import React from "react";
import { Link } from "react-router-dom";

const AuthLink = ({ text, linkText, to }) => {
  return (
    <p className="mt-4 text-center">
      {text}{" "}
      <Link to={to} className="text-yellow-500 underline hover:text-yellow-600">
        {linkText}
      </Link>
    </p>
  );
};

export default AuthLink;