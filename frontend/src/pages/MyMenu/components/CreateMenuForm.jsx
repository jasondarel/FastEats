import React, { useState } from "react";
import ImageUploader from "./ImageUploader";
import CategorySelector from "./CategorySelector";

const CreateMenuForm = ({ onClose, onSubmit }) => {
  // Form state
  const [menuName, setMenuName] = useState("");
  const [menuDesc, setMenuDesc] = useState("");
  const [menuPrice, setMenuPrice] = useState("");
  const [menuImage, setMenuImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Create FormData object
    const formData = new FormData();
    formData.append("menuName", menuName);
    formData.append("menuDescription", menuDesc);
    formData.append("menuCategory", selectedCategory);
    formData.append("menuPrice", menuPrice);
    if (menuImage) {
      formData.append("menuImage", menuImage);
    }

    // Submit the form data to the parent component
    onSubmit(formData);
  };

  return (
    <div className="flex items-center justify-center backdrop-blur-xs fixed top-0 right-0 bottom-0 left-0 z-50">
      <div className="bg-gradient-to-br from-yellow-300 to-yellow-800 via-yellow-500 py-5 px-8 scale-90 rounded-md overflow-y-auto relative max-h-screen sm:min-w-lg sm:scale-[0.8] lg:min-w-xl lg:scale-95 xl:min-w-3xl">
        <div className="flex items-center justify-center relative">
          <h2 className="font-extrabold text-2xl my-5 -mt-2 text-center text-yellow-900 sm:text-4xl">
            Create Menu Form
            <div className="absolute -top-1.5 -right-4">
              <button onClick={onClose} className="text-2xl cursor-pointer">
                ❌
              </button>
            </div>
          </h2>
        </div>
        <div className="border border-yellow-200 p-4 bg-white rounded-md">
          <form className="text-start" onSubmit={handleSubmit}>
            <ImageUploader onImageChange={(file) => setMenuImage(file)} />

            {/* Input Name */}
            <div className="my-4">
              <label className="font-semibold text-sm">
                Name<span className="text-pink-600">*</span>
              </label>
              <input
                type="text"
                className="input border mt-1 border-slate-400 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-0"
                placeholder="Your Menu's Name"
                value={menuName}
                onChange={(e) => setMenuName(e.target.value)}
                required
              />
            </div>

            {/* Input Description */}
            <div className="my-4">
              <label className="font-semibold text-sm">
                Description<span className="text-pink-600">*</span>
              </label>
              <textarea
                className="input mt-1 border border-slate-400 rounded-md p-2 w-full h-32 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-0"
                placeholder="Your Menu's Description"
                value={menuDesc}
                onChange={(e) => setMenuDesc(e.target.value)}
                required
              />
            </div>

            {/* Input price */}
            <div className="my-4">
              <label className="font-semibold text-sm">
                Price<span className="text-pink-600">*</span>
              </label>
              <input
                type="number"
                className="input border mt-1 border-slate-400 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-0"
                placeholder="Your Menu's Price"
                value={menuPrice}
                onChange={(e) => setMenuPrice(e.target.value)}
                required
              />
            </div>

            {/* Menu Category */}
            <CategorySelector
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />

            {/* Submit Button */}
            <div className="mt-10 flex items-center justify-center w-full">
              <button
                type="submit"
                className="bg-gradient-to-br from-yellow-400 via-yellow-600 to-yellow-800 text-white p-2.5 rounded-xl text-xl font-bold cursor-pointer w-full"
                disabled={
                  !menuName || !menuDesc || !menuPrice || !selectedCategory
                }
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateMenuForm;
