import React from "react";

const FormHeader = ({ title, backLink }) => {
  return (
    <div className="flex items-center justify-center relative">
      <h2 className="font-extrabold text-2xl my-5 -mt-2 text-center text-yellow-900 sm:text-4xl">
        {title}
        <div className="absolute -top-1.5 -right-4">
          <a href={backLink} className="text-2xl cursor-pointer">
            ❌
          </a>
        </div>
      </h2>
    </div>
  );
};

export default FormHeader;
