import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="w-64 h-screen bg-white text-yellow-500 p-5">
      <img
        src="/logo_FastEats.png" //logo
        alt="Logo"
        className="w-32 mx-auto mb-4"
      />
      <nav>
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
    </aside>
  );
};

export default Sidebar;
