import { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axios from "axios";
import { useDispatch } from "react-redux"; // Add this import
import { logout } from "../app/auth/authSlice"; // Add this import - adjust path if needed

const Sidebar = ({ isTaskbarOpen }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Add this
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showHamburger, setShowHamburger] = useState(false);
  // Changed to include medium screens (width < 1024px)
  const [isMobileOrMedium, setIsMobileOrMedium] = useState(
    window.innerWidth < 1024
  );
  const [role, setRole] = useState("");
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
    } else if (isMobileOrMedium && !isTaskbarOpen) {
      setShowHamburger(true);
    }
  }, [isSidebarOpen, isMobileOrMedium, isTaskbarOpen]);

  useEffect(() => {
    const updateSidebarState = () => {
      // Changed to check for medium screens (width < 1024px)
      const newIsMobileOrMedium = window.innerWidth < 1024;
      setIsMobileOrMedium(newIsMobileOrMedium);

      if (!newIsMobileOrMedium) {
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

    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch("http://localhost:5000/user/user", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch user profile. Status: ${response.status}`
          );
        }

        const data = await response.json();
        setRole(data.user.role);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
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
    MySwal.fire({
      title: "Logout",
      text: "Are you sure you want to logout?",
      icon: "warning",
      confirmButtonText: "Yes, Logout",
      confirmButtonColor: "#efb100",
      showCancelButton: true,
      cancelButtonText: "Cancel",
      cancelButtonColor: "#555",
    }).then((result) => {
      if (result.isConfirmed) {
        // Use Redux action to logout
        dispatch(logout());

        setIsProfileDropupOpen(false);
        MySwal.fire({
          title: "Logged out!",
          text: "You have been successfully logged out.",
          icon: "success",
          confirmButtonColor: "#efb100",
        }).then(() => {
          navigate("/login");
        });
      }
    });
  };

  const toggleSidebar = () => {
    // Only toggle if it wasn't dragged
    if (!wasDraggedRef.current && isMobileOrMedium) {
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
        } lg:translate-x-0`}
        style={{
          backgroundImage: "url('/foodbg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {isSidebarOpen && isMobileOrMedium && (
          <button
            onClick={toggleSidebar}
            className="absolute top-5 right-5 text-yellow-500 text-2xl z-50 lg:hidden hover:cursor-pointer"
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
              {role == "user" && (
                <li>
                  <Link
                    to="/home"
                    className="block p-2 rounded hover:bg-yellow-500 hover:text-white font-bold text-xl transition"
                  >
                    Home
                  </Link>
                </li>
              )}

              {role == "user" && (
                <li>
                  <Link
                    to="/orders"
                    className="block p-2 rounded hover:bg-yellow-500 hover:text-yellow-100 font-bold text-xl transition"
                  >
                    My Orders
                  </Link>
                </li>
              )}

              {role == "user" && (
                <li>
                  <Link
                    to="/cart"
                    className="block p-2 rounded hover:bg-yellow-500 hover:text-yellow-100 font-bold text-xl transition"
                  >
                    Cart
                  </Link>
                </li>
              )}

              {role === "seller" && (
                <li>
                  <Link
                    to="/restaurant-dashboard"
                    className="block p-2 rounded hover:bg-yellow-500 hover:text-yellow-100 font-bold text-xl transition"
                  >
                    Dashboard
                  </Link>
                </li>
              )}

              {role == "seller" && (
                <li>
                  <Link
                    to="/manage-restaurant"
                    className="block p-2 rounded hover:bg-yellow-500 hover:text-white font-bold text-xl transition"
                  >
                    Manage Restaurant
                  </Link>
                </li>
              )}

              {role === "seller" && (
                <li>
                  <Link
                    to="/order-list"
                    className="block p-2 rounded hover:bg-yellow-500 hover:text-yellow-100 font-bold text-xl transition"
                  >
                    Order List
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          {/* Profile section with dropdown */}
          <div ref={dropupRef} className="relative">
            {/* Profile button that toggles the dropdown */}
            <div
              onClick={toggleProfileDropup}
              className="flex items-center p-2 rounded-lg hover:bg-black hover:bg-opacity-30 transition cursor-pointer"
            >
              {/* Profile Picture - Added min-width to prevent squeezing */}
              <div className="bg-white w-12 h-12 min-w-[3rem] rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                  src={
                    profile.profile_photo ||
                    "https://static-00.iconduck.com/assets.00/avatar-default-icon-2048x2048-h6w375ur.png"
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Profile Info - Improved width management */}
              <div className="flex flex-col ml-2 flex-grow min-w-0">
                <h2 className="font-bold text-xl truncate text-ellipsis overflow-hidden whitespace-nowrap">
                  {profile.name || "guest"}
                </h2>
                <h2 className="font-semibold truncate text-ellipsis overflow-hidden whitespace-nowrap text-sm">
                  {profile.email}
                </h2>
              </div>

              {/* Dropdown indicator arrow - Made it flex-shrink-0 */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ml-1 transform transition-transform flex-shrink-0 ${
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
              <div className="absolute bottom-full left-0 w-full bg-white bg-opacity-90 rounded-lg shadow-lg overflow-hidden z-20">
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
                  className="block w-full px-4 py-2 text-left text-yellow-700 hover:bg-yellow-500 hover:text-white transition cursor-pointer"
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
