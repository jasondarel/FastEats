import React, { useState } from "react";
import Sidebar from "../components/Sidebar";

//icon
import foodIcon from "../assets/foods-icon.png";
import drinkIcon from "../assets/drinks-icon.png";
import dessertIcon from "../assets/dessert-icon.png";
import otherIcon from "../assets/other-icon.png";

const CreateMenuForm = () => {
  // State untuk menyimpan kategori yang dipilih
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Fungsi untuk menangani klik pada kategori
  const handleClick = (category) => {
    setSelectedCategory(category); // Set kategori yang dipilih
  };

  const [image, setImage] = useState(null);

  // Fungsi untuk menangani perubahan file gambar
  const handleImageChange = (e) => {
    const file = e.target.files[0]; // Ambil file yang dipilih
    if (file) {
      setImage(URL.createObjectURL(file)); // Membuat URL untuk pratinjau gambar
    }
  };

  return (
    <div className="flex ml-64 ">
      <Sidebar />
      <div className="flex items-center justify-center min-h-screen min-w-full">
        <div className="rounded-md bg-linear-to-br from-yellow-300 to-yellow-800 via-yellow-500 p-10">
          <div className="relative flex items-center justify-center">
            <h2 className="font-bold text-4xl my-5 -mt-2 text-center text-white">
              Create Menu Form
            </h2>
            <div className="absolute -top-4 -right-5 text-4xl">
              <a href="#" className="cursor-pointer">
                ❌
              </a>
            </div>
          </div>
          <div className="border border-yellow-200 p-4 bg-slate-100 rounded-md">
            <form className="text-start">
              <h2 className="font-semibold text-xl">Create New Menu</h2>
              <hr className="my-2 border-slate-400"></hr>

              {/* upload menu image*/}
              <div className="my-4">
                <label className="font-semibold text-sm">
                  Upload Image<span className="text-pink-600">*</span>
                </label>
                <div className="border border-slate-400 rounded-md border-dashed mt-1 w-150 min-h-50 flex flex-col items-center justify-center">
                  <p className="font-semibold text-slate-600 text-center my-2">
                    JPG, PNG, GIF, WEBP, Max 100mb.
                  </p>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="file-upload"
                    className="bg-yellow-500 text-white p-2 cursor-pointer hover:bg-yellow-600"
                  >
                    Choose File
                  </label>
                  {/* Tampilkan pratinjau gambar jika ada */}
                  {image && (
                    <div className="mt-2 w-full flex justify-center">
                      <img
                        src={image}
                        alt="Preview"
                        className="max-w-full object-contain rounded-md"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* input name */}
              <div className="my-4">
                <label className="font-semibold text-sm">
                  Name<span className="text-pink-600">*</span>
                </label>
                <input
                  type="text"
                  className="input border mt-1 border-slate-400 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-0"
                  placeholder="Your Menu's Name"
                ></input>
              </div>

              {/* input Desc */}
              <div className="my-4">
                <label className="font-semibold text-sm">
                  Description<span className="text-pink-600">*</span>
                </label>
                <textarea
                  className="input mt-1 border border-slate-400 rounded-md p-2 w-full h-32 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-0"
                  placeholder="Your Menu's Description"
                ></textarea>
              </div>

              {/* Menu Category */}
              <div className="my-4">
                <label className="font-semibold text-sm">
                  Menu Category<span className="text-pink-600">*</span>
                </label>
                <div className="grid grid-cols-4 gap-0 mt-1">
                  {/* Kategori Foods */}
                  <div
                    className={`border border-yellow-400 rounded-l-md p-4 text-center cursor-pointer flex flex-col items-center justify-center h-full group transition ${
                      selectedCategory === "Foods"
                        ? "bg-yellow-500"
                        : "hover:bg-yellow-400"
                    }`}
                    onClick={() => handleClick("Foods")}
                  >
                    <div className="group-hover:scale-110">
                      <img
                        src={foodIcon}
                        alt="Foods"
                        className="mb-2 h-10 w-10 object-contain"
                      />
                      Foods
                    </div>
                  </div>

                  {/* Kategori Drinks */}
                  <div
                    className={`border border-l-0 border-r-0 border-yellow-400 p-4 text-center cursor-pointer flex flex-col items-center justify-center h-full group transition ${
                      selectedCategory === "Drinks"
                        ? "bg-yellow-500"
                        : "hover:bg-yellow-400"
                    }`}
                    onClick={() => handleClick("Drinks")}
                  >
                    <div className="group-hover:scale-110">
                      <img
                        src={drinkIcon}
                        alt="Drinks"
                        className="mb-2 h-10 w-10 object-contain"
                      />
                      Drinks
                    </div>
                  </div>

                  {/* Kategori Dessert */}
                  <div
                    className={`border border-r-0 border-yellow-400 p-4 text-center cursor-pointer flex flex-col items-center justify-center h-full group pl-5 transition ${
                      selectedCategory === "Dessert"
                        ? "bg-yellow-500"
                        : "hover:bg-yellow-400"
                    }`}
                    onClick={() => handleClick("Dessert")}
                  >
                    <div className="group-hover:scale-110">
                      <img
                        src={dessertIcon}
                        alt="Dessert"
                        className="mb-2 h-10 w-10 object-contain ml-1"
                      />
                      Dessert
                    </div>
                  </div>

                  {/* Kategori Other */}
                  <div
                    className={`border border-yellow-400 rounded-r-md p-4 text-center cursor-pointer flex flex-col items-center justify-center h-full group transition ${
                      selectedCategory === "Other"
                        ? "bg-yellow-500"
                        : "hover:bg-yellow-400"
                    }`}
                    onClick={() => handleClick("Other")}
                  >
                    <div className="group-hover:scale-110">
                      <img
                        src={otherIcon}
                        alt="Other"
                        className="mb-2 h-10 w-10 object-contain"
                      />
                      Other
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex items-end justify-end">
                <button className="bg-yellow-600 text-white p-2.5 rounded-xl text-xl font-semibold cursor-pointer">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMenuForm;
