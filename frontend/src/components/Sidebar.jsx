import { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axios from "axios";

const Sidebar = ({ isTaskbarOpen }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showHamburger, setShowHamburger] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isProfileDropupOpen, setIsProfileDropupOpen] = useState(false);

  const MySwal = withReactContent(Swal);
  const buttonRef = useRef(null);
  const isDraggingRef = useRef(false);
  const wasDraggedRef = useRef(false);
  const dropupRef = useRef(null);
  const [initialPosition, setInitialPosition] = useState({
    x: window.innerWidth - 70,
    y: 100,
  });

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    profile_photo: "",
  });

  useEffect(() => {
    if (isSidebarOpen) {
      setShowHamburger(false);
    } else if (isMobile && !isTaskbarOpen) {
      setShowHamburger(true);
    }
  }, [isSidebarOpen, isMobile, isTaskbarOpen]);

  useEffect(() => {
    const updateSidebarState = () => {
      const newIsMobile = window.innerWidth < 768;
      setIsMobile(newIsMobile);

      if (!newIsMobile) {
        setIsSidebarOpen(true);
        setShowHamburger(false);
      } else {
        setShowHamburger(!isTaskbarOpen);
        setIsSidebarOpen(false);
        setInitialPosition((prev) => ({
          x: window.innerWidth - 70,
          y: prev.y,
        }));
      }
    };

    updateSidebarState();
    window.addEventListener("resize", updateSidebarState);
    return () => window.removeEventListener("resize", updateSidebarState);
  }, [isTaskbarOpen]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get("http://localhost:5002/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProfile({
          name: response.data.user.name,
          email: response.data.user.email,
          profile_photo: response.data.user.profile_photo,
        });
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
    fetchUserProfile();
  }, []);

  useEffect(() => {
    // Handle clicks outside the dropup menu to close it
    const handleClickOutside = (event) => {
      if (dropupRef.current && !dropupRef.current.contains(event.target)) {
        setIsProfileDropupOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsProfileDropupOpen(false);
    MySwal.fire({
      title: "Logged Out",
      text: "Successfully Logged Out!",
      icon: "info",
      confirmButtonText: "Ok",
      confirmButtonColor: "#efb100",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/login");
      }
    });
  };

  const toggleSidebar = () => {
    // Only toggle if it wasn't dragged
    if (!wasDraggedRef.current && isMobile) {
      setIsSidebarOpen(!isSidebarOpen);
      setShowHamburger(!isSidebarOpen);
    }
    // Reset the dragged state
    wasDraggedRef.current = false;
  };

  const toggleProfileDropup = () => {
    setIsProfileDropupOpen(!isProfileDropupOpen);
  };

  const handleMouseDown = (e) => {
    const button = buttonRef.current;
    if (!button) return;

    e.preventDefault();
    isDraggingRef.current = true;
    wasDraggedRef.current = false; // Reset drag state on mouse down

    let startX = e.clientX - button.offsetLeft;
    let startY = e.clientY - button.offsetTop;
    let hasMoved = false; // Track if any movement occurred

    function onMouseMove(e) {
      if (!isDraggingRef.current) return;

      hasMoved = true; // Movement detected
      wasDraggedRef.current = true; // Set drag state

      let left = e.clientX - startX;
      let top = e.clientY - startY;

      // Constrain to viewport
      left = Math.max(20, Math.min(window.innerWidth - 70, left));
      top = Math.max(20, Math.min(window.innerHeight - 70, top));

      // Disable transition during drag for smooth movement
      button.style.transition = "none";
      button.style.left = `${left}px`;
      button.style.top = `${top}px`;
    }

    function onMouseUp() {
      if (!isDraggingRef.current || !button) return;

      isDraggingRef.current = false;

      // Only snap if actually dragged
      if (hasMoved) {
        const currentX = button.offsetLeft;
        const snappedX =
          currentX < window.innerWidth / 2 ? 20 : window.innerWidth - 70;

        // Re-enable transition for smooth snapping
        button.style.transition = "left 0.3s ease";
        button.style.left = `${snappedX}px`;
        setInitialPosition({
          x: snappedX,
          y: button.offsetTop,
        });
      }

      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div className="z-10">
      {showHamburger && (
        <button
          ref={buttonRef}
          onMouseDown={handleMouseDown}
          onClick={toggleSidebar}
          className="fixed z-40 text-yellow-500 text-3xl p-2 rounded-full shadow-lg bg-white border cursor-grab active:cursor-grabbing"
          style={{
            left: `${initialPosition.x}px`,
            top: `${initialPosition.y}px`,
            touchAction: "none",
            transition: "left 0.3s ease", // Add transition for smooth snapping
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
      )}

      <aside
        className={`fixed top-0 left-0 w-64 h-full text-yellow-500 p-5 flex flex-col shadow-lg bg-white transform transition-transform duration-300 ease-in-out z-10 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
        style={{
          backgroundImage: "url('/foodbg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {isSidebarOpen && isMobile && (
          <button
            onClick={toggleSidebar}
            className="absolute top-5 right-5 text-yellow-500 text-2xl z-50 md:hidden hover:cursor-pointer"
          >
            &times;
          </button>
        )}

        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-70 -z-10"></div>

        <div className="relative z-10 flex flex-col flex-grow">
          <img
            src="/logo_FastEats.png"
            alt="Logo"
            className="w-32 mx-auto mb-4"
          />

          <nav className="flex-grow">
            <ul className="space-y-2">
              <li>
                <Link
                  to="/home"
                  className="block p-2 rounded hover:bg-yellow-500 hover:text-white font-bold text-xl transition"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/become-seller"
                  className="block p-2 rounded hover:bg-yellow-500 hover:text-white font-bold text-xl transition"
                >
                  My Restaurant
                </Link>
              </li>
              <li>
                <Link
                  to="/orders"
                  className="block p-2 rounded hover:bg-yellow-500 hover:text-yellow-100 font-bold text-xl transition"
                >
                  My Orders
                </Link>
              </li>
            </ul>
          </nav>

          {/* Profile section with dropdown */}
          <div ref={dropupRef} className="relative">
            {/* Profile button that toggles the dropdown */}
            <div
              onClick={toggleProfileDropup}
              className="flex items-center p-2 rounded-lg hover:bg-black hover:bg-opacity-30 transition cursor-pointer"
            >
              {/* Profile Picture */}
              <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center overflow-hidden">
                <img
                  src={
                    profile.profile_photo ||
                    "https://static-00.iconduck.com/assets.00/avatar-default-icon-2048x2048-h6w375ur.png"
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Profile Info */}
              <div className="flex flex-col ml-2 max-w-[150px]">
                <h2 className="font-bold text-xl truncate overflow-hidden whitespace-nowrap">
                  {profile.name || "guest"}
                </h2>
                <h2 className="font-semibold truncate overflow-hidden whitespace-nowrap text-sm">
                  {profile.email}
                </h2>
              </div>

              {/* Dropdown indicator arrow */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ml-1 transform transition-transform ${
                  isProfileDropupOpen ? "" : "rotate-180"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>

            {/* Profile dropdown menu */}
            {isProfileDropupOpen && (
              <div className="absolute bottom-full left-0 w-full mb-2 bg-white bg-opacity-90 rounded-lg shadow-lg overflow-hidden z-20">
                <Link
                  to="/profile"
                  onClick={() => setIsProfileDropupOpen(false)}
                  className="block w-full px-4 py-2 text-yellow-700 hover:bg-yellow-500 hover:text-white transition"
                >
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    View Profile
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-left text-yellow-700 hover:bg-yellow-500 hover:text-white transition"
                >
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Logout
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
