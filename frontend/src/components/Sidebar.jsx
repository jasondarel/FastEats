import { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const Sidebar = ({ isTaskbarOpen }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showHamburger, setShowHamburger] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const MySwal = withReactContent(Swal);
  const buttonRef = useRef(null);
  const isDraggingRef = useRef(false);
  const wasDraggedRef = useRef(false);
  const [initialPosition, setInitialPosition] = useState({
    x: window.innerWidth - 70,
    y: 100,
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

  const handleLogout = () => {
    localStorage.removeItem("token");
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
                  to="/profile"
                  className="block p-2 rounded hover:bg-yellow-500 hover:text-white font-bold text-xl transition"
                >
                  Profile
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

          <button
            onClick={handleLogout}
            className="w-full p-2 text-center rounded bg-yellow-500 text-white hover:bg-yellow-600 hover:cursor-pointer transition"
          >
            Logout
          </button>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
