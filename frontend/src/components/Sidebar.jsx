import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const Sidebar = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showHamburger, setShowHamburger] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleSidebar = () => {
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
      setTimeout(() => setShowHamburger(true), 300); // Delay to match transition
    } else {
      setShowHamburger(false);
      setIsSidebarOpen(true);
    }
  };

  return (
    <>
      {/* Fixed Hamburger Button */}
      {showHamburger && (
        <button
          onClick={toggleSidebar}
          className="fixed top-5 left-5 z-50 text-yellow-500 text-3xl p-2 rounded-full shadow-lg bg-white border border-white hover:cursor-pointer"
        >
          &#9776;
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 w-64 h-full text-yellow-500 p-5 flex flex-col shadow-lg transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close Button */}
        {isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="absolute top-5 right-5 text-yellow-500 text-2xl z-50 hover:cursor-pointer"
          >
            &times;
          </button>
        )}

        {/* Background Image */}
        <div
          className="absolute top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat grayscale opacity-80 -z-10 pointer-events-none"
          style={{ backgroundImage: "url('/foodbg.jpg')" }}
        >
          <div className="absolute inset-0 bg-black opacity-70"></div>
        </div>

        {/* Sidebar Content */}
        <div className="relative z-10 flex flex-col flex-grow">
          {/* Logo */}
          <img
            src="/logo_FastEats.png"
            alt="Logo"
            className="w-32 mx-auto mb-4"
          />

          {/* Navigation */}
          <nav className="flex-grow">
            <ul className="space-y-2">
              <li>
                <Link
                  to="/home"
                  className="block p-2 rounded hover:bg-yellow-500 hover:text-yellow-100 font-bold"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="block p-2 rounded hover:bg-yellow-500 hover:text-yellow-100 font-bold"
                >
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  to="/become-seller"
                  className="block p-2 rounded hover:bg-yellow-500 hover:text-yellow-100 font-bold"
                >
                  My Restaurant
                </Link>
              </li>
              <li>
                <Link
                  to="/settings"
                  className="block p-2 rounded hover:bg-yellow-500 hover:text-yellow-100 font-bold"
                >
                  Settings
                </Link>
              </li>
            </ul>
          </nav>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full p-2 text-center rounded bg-yellow-500 text-white hover:bg-yellow-600"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
