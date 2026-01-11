/* eslint-disable react/prop-types */
import { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axios from "axios";
import { useDispatch } from "react-redux";
import { logout } from "../app/auth/authSlice";
import { API_URL } from "../config/api";
import logoutService from "../service/userServices/logoutService";
import { IoIosMenu, IoIosLogOut } from "react-icons/io";
import { IoChevronUpOutline } from "react-icons/io5";
import { FaRegUser } from "react-icons/fa";

const Sidebar = ({ isTaskbarOpen }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showHamburger, setShowHamburger] = useState(false);
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
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (isSidebarOpen) {
      setShowHamburger(false);
    } else if (isMobileOrMedium && !isTaskbarOpen) {
      setShowHamburger(true);
    }
  }, [isSidebarOpen, isMobileOrMedium, isTaskbarOpen]);

  useEffect(() => {
    const updateSidebarState = () => {
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
        setLoadingProfile(true);
        const response = await axios.get(`${API_URL}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile({
          name: response.data.user.name,
          email: response.data.user.email,
          profile_photo: response.data.user.profile_photo,
        });
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`${API_URL}/user/user`, {
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
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          MySwal.fire({
            title: "Logging out...",
            text: "Please wait",
            icon: "info",
            showConfirmButton: false,
            allowOutsideClick: false,
            willOpen: () => {
              MySwal.showLoading();
            }
          });

          const token = localStorage.getItem("token");
          console.log("Logging out with token:", token);
          if (token) {
            await logoutService(token);
          }

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
        } catch (error) {
          console.error("Logout error:", error);
          
          dispatch(logout());
          setIsProfileDropupOpen(false);
          
          MySwal.fire({
            title: "Logged out!",
            text: "You have been logged out locally.",
            icon: "success",
            confirmButtonColor: "#efb100",
          }).then(() => {
            navigate("/login");
          });
        }
      }
    });
  };

  const toggleSidebar = () => {
    if (!wasDraggedRef.current && isMobileOrMedium) {
      setIsSidebarOpen(!isSidebarOpen);
      setShowHamburger(!isSidebarOpen);
    }

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
    wasDraggedRef.current = false;

    let startX = e.clientX - button.offsetLeft;
    let startY = e.clientY - button.offsetTop;
    let hasMoved = false;

    function onMouseMove(e) {
      if (!isDraggingRef.current) return;

      hasMoved = true;
      wasDraggedRef.current = true;

      let left = e.clientX - startX;
      let top = e.clientY - startY;

      left = Math.max(20, Math.min(window.innerWidth - 70, left));
      top = Math.max(20, Math.min(window.innerHeight - 70, top));

      button.style.transition = "none";
      button.style.left = `${left}px`;
      button.style.top = `${top}px`;
    }

    function onMouseUp() {
      if (!isDraggingRef.current || !button) return;

      isDraggingRef.current = false;

      if (hasMoved) {
        const currentX = button.offsetLeft;
        const snappedX =
          currentX < window.innerWidth / 2 ? 20 : window.innerWidth - 70;

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
            transition: "left 0.3s ease",
          }}
        >
          <IoIosMenu />
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

              {role == "user" && (
                <li>
                  <Link
                    to="/chat"
                    className="block p-2 rounded hover:bg-yellow-500 hover:text-yellow-100 font-bold text-xl transition"
                  >
                    Chats
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

              {role == "seller" && (
                <li>
                  <Link
                    to="/chat"
                    className="block p-2 rounded hover:bg-yellow-500 hover:text-yellow-100 font-bold text-xl transition"
                  >
                    Chats
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          <div ref={dropupRef} className="relative">
            <div
              onClick={toggleProfileDropup}
              className="flex items-center p-2 rounded-lg hover:bg-black hover:bg-opacity-30 transition cursor-pointer"
            >
              <div className="bg-white w-12 h-12 min-w-[3rem] rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                  src={
                    profile.profile_photo ||
                    "https://cdn-icons-png.flaticon.com/512/9187/9187532.png"
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>

              {loadingProfile ? (
                <div className="flex flex-col ml-2 flex-grow min-w-0 text-yellow-200 italic">
                  loading...
                </div>
              ) : profile && profile.name ? (
                <div className="flex flex-col ml-2 flex-grow min-w-0">
                  <h2 className="font-bold text-xl truncate text-ellipsis overflow-hidden whitespace-nowrap">
                    {profile.name}
                  </h2>
                  <h2 className="font-semibold truncate text-ellipsis overflow-hidden whitespace-nowrap text-sm">
                    {profile.email}
                  </h2>
                </div>
              ) : (
                <div className="flex flex-col ml-2 flex-grow min-w-0">
                  <h2 className="font-bold text-xl truncate text-ellipsis overflow-hidden whitespace-nowrap">
                    guest
                  </h2>
                  <h2 className="font-semibold truncate text-ellipsis overflow-hidden whitespace-nowrap text-sm">
                    guest@email.com
                  </h2>
                </div>
              )}

              <IoChevronUpOutline />
            </div>

            {isProfileDropupOpen && (
              <div className="absolute bottom-full left-0 w-full bg-white bg-opacity-90 rounded-lg shadow-lg overflow-hidden z-20">
                <Link
                  to="/profile"
                  onClick={() => setIsProfileDropupOpen(false)}
                  className="block w-full px-4 py-2 text-yellow-700 hover:bg-yellow-500 hover:text-white transition"
                >
                  <div className="flex items-center">
                    <FaRegUser className="mr-2" />
                    View Profile
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-left text-yellow-700 hover:bg-yellow-500 hover:text-white transition cursor-pointer"
                >
                  <div className="flex items-center">
                    <IoIosLogOut className="mr-2" />
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
