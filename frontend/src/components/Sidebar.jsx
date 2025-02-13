import { Link, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token
    navigate("/login"); // Redirect to login page
  };

  return (
    <aside className="fixed top-0 left-0 w-64 h-screen text-yellow-500 p-5 flex flex-col shadow-lg">
      {/* Background Image with Darker Overlay */}
      <div
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat grayscale opacity-80 -z-10"
        style={{ backgroundImage: "url('/foodbg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black opacity-70"></div>{" "}
        {/* Darker Overlay */}
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
  );
};

export default Sidebar;
