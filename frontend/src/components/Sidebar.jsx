import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Sidebar = ({ isTaskbarOpen }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showHamburger, setShowHamburger] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Cek awal ukuran layar

  // Effect untuk update ukuran layar & sembunyikan hamburger saat taskbar aktif
  useEffect(() => {
    const updateSidebarState = () => {
      const newIsMobile = window.innerWidth < 768;
      setIsMobile(newIsMobile);

      if (!newIsMobile) {
        // Jika desktop, sidebar tetap terbuka & hamburger disembunyikan
        setIsSidebarOpen(true);
        setShowHamburger(false);
      } else {
        // Jika mobile, atur sesuai dengan taskbar
        if (isTaskbarOpen) {
          setShowHamburger(false); // Jangan tampilkan hamburger saat taskbar aktif
        } else {
          setShowHamburger(true);
          setIsSidebarOpen(false);
        }
      }
    };

    updateSidebarState(); // Panggil sekali saat komponen dimuat

    window.addEventListener("resize", updateSidebarState);
    return () => window.removeEventListener("resize", updateSidebarState);
  }, [isTaskbarOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(!isSidebarOpen);
    }
  };

  return (
    <>
      {/* Tombol Hamburger (Hanya di Mobile & Taskbar tidak aktif) */}
      {showHamburger && (
        <button
          onClick={toggleSidebar}
          className="fixed left-5 z-40 text-yellow-500 text-3xl p-2 rounded-full shadow-lg bg-white border transition-all duration-300 cursor-pointer top-16"
        >
          &#9776;
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 w-64 h-full text-yellow-500 p-5 flex flex-col shadow-lg bg-white transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
        style={{
          backgroundImage: "url('/foodbg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Tombol Close (Hanya di Mobile) */}
        {isSidebarOpen && isMobile && (
          <button
            onClick={toggleSidebar}
            className="absolute top-5 right-5 text-yellow-500 text-2xl z-50 md:hidden"
          >
            &times;
          </button>
        )}

        {/* Overlay Background */}
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-70 -z-10"></div>

        {/* Sidebar Content */}
        <div className="relative z-10 flex flex-col flex-grow">
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
