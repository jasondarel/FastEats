import { Link, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token
    navigate("/login"); // Redirect to login page
  };

  return (
    <aside className="fixed top-0 left-0 w-64 h-screen bg-white text-yellow-500 p-5 flex flex-col shadow-lg">
      {/* Logo */}
      <img src="/logo_FastEats.png" alt="Logo" className="w-32 mx-auto mb-4" />

      {/* Navigation */}
      <nav className="flex-1">
        <ul className="space-y-2">
          <li>
            <Link
              to="/home"
              className="block p-2 rounded hover:bg-yellow-500 hover:text-yellow-100"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/profile"
              className="block p-2 rounded hover:bg-yellow-500 hover:text-yellow-100"
            >
              Profile
            </Link>
          </li>
          <li>
            <Link
              to="/settings"
              className="block p-2 rounded hover:bg-yellow-500 hover:text-yellow-100"
            >
              Settings
            </Link>
          </li>
        </ul>
      </nav>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="mt-auto w-full p-2 text-center rounded bg-yellow-500 text-white hover:bg-yellow-600 hover:cursor-pointer"
      >
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
