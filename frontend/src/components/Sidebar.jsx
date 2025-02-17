import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const Sidebar = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Controls sidebar visibility
  const [showHamburger, setShowHamburger] = useState(true); // Controls when the hamburger is rendered

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleSidebar = () => {
    if (isSidebarOpen) {
      // Closing sidebar: start slide-out and delay showing hamburger
      setIsSidebarOpen(false);
      setTimeout(() => {
        setShowHamburger(true);
      }, 300); // This should match the sidebar's transition duration (300ms)
    } else {
      // Opening sidebar: hide hamburger immediately and show sidebar
      setShowHamburger(false);
      setIsSidebarOpen(true);
    }
  };

  return (
    <div>
      {/* Hamburger Button (Visible only when showHamburger is true) */}
      {showHamburger && (
        <button
          onClick={toggleSidebar}
          className="absolute top-5 left-5 z-20 text-yellow-500 text-3xl hover:cursor-pointer p-2 rounded-full shadow-lg bg-white border border-white"
        >
          &#9776; {/* Hamburger icon */}
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 w-64 h-screen text-yellow-500 p-5 flex flex-col shadow-lg transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close Button (Visible only when sidebar is open) */}
        {isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="absolute top-5 right-5 text-yellow-500 text-2xl hover:cursor-pointer z-30"
          >
            &times; {/* Close icon */}
          </button>
        )}

        {/* Background Image with Darker Overlay */}
        <div
          className="absolute top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat grayscale opacity-80 -z-10 pointer-events-none"
          style={{ backgroundImage: "url('/foodbg.jpg')" }}
        >
          <div className="absolute inset-0 bg-black opacity-70"></div>
        </div>

        {/* Content */}
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

          {/* Logout Button - Sticks to Bottom */}
          <button
            onClick={handleLogout}
            className="w-full p-2 text-center rounded bg-yellow-500 text-white hover:bg-yellow-600 hover:cursor-pointer"
          >
            Logout
          </button>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
