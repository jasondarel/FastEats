/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";

const MenuForm = ({
  menuName,
  setMenuName,
  menuDesc,
  setMenuDesc,
  menuPrice,
  setMenuPrice,
}) => {
  return (
    <>
      {/* Input Name */}
      <div className="my-4">
        <label className="font-semibold text-sm">
          Update Name<span className="text-pink-600">*</span>
        </label>
        <input
          type="text"
          className="input border mt-1 border-slate-400 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-0"
          placeholder="Your Menu's Name"
          value={menuName}
          onChange={(e) => setMenuName(e.target.value)}
        />
      </div>

      {/* Input Description */}
      <div className="my-4">
        <label className="font-semibold text-sm">
          Update Description<span className="text-pink-600">*</span>
        </label>
        <textarea
          className="input mt-1 border border-slate-400 rounded-md p-2 w-full h-32 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-0"
          placeholder="Your Menu's Description"
          value={menuDesc}
          onChange={(e) => setMenuDesc(e.target.value)}
        />
      </div>

      {/* Input price */}
      <div className="my-4">
        <label className="font-semibold text-sm">
          Update Price<span className="text-pink-600">*</span>
        </label>
        <input
          type="number"
          className="input border mt-1 border-slate-400 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-0"
          placeholder="Your Menu's Price"
          value={menuPrice}
          onChange={(e) => setMenuPrice(e.target.value)}
        />
      </div>
    </>
  );
};

export default MenuForm;
