import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home/index";
import Login from "./pages/Login";
import Register from "./pages/register";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import React from "react";
import MenuPage from "./pages/MenuPage/index";
import BecomeSeller from "./pages/BecomeSeller";
import ManageRestaurant from "./pages/ManageRestaurant/ManageRestaurant";
import MyMenuPage from "./pages/MyMenu";
import Cart from "./pages/Cart";
import MenuDetails from "./pages/MenuDetails";
import MyMenuDetails from "./pages/MyMenuDetails";
import UpdateMenu from "./pages/UpdateMenu";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import OrderList from "./pages/OrderList";
import "flowbite";
import Payment from "./pages/Thanks";
import Thanks from "./pages/Thanks/index";
import PayNow from "./pages/PayNow";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import OrderSummary from "./pages/OrderSummary";
import OtpVerifPage from "./pages/OtpVerifPage";

function App() {
  return (
    <div className="flex">
      <div className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/otp-verification" element={<OtpVerifPage />} />

          {/* User-only Routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute requiredRoles={["user"]}>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute requiredRoles={["user"]}>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurant/:restaurantId/menu"
            element={
              <ProtectedRoute requiredRoles={["user"]}>
                <MenuPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu-details/:menuId"
            element={
              <ProtectedRoute requiredRoles={["user"]}>
                <MenuDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute requiredRoles={["user"]}>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order/:orderId"
            element={
              <ProtectedRoute requiredRoles={["user"]}>
                <OrderDetails />
              </ProtectedRoute>
            }
          />

          {/* Seller-only Routes */}
          <Route
            path="/my-menu"
            element={
              <ProtectedRoute requiredRoles={["seller"]}>
                <MyMenuPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-restaurant"
            element={
              <ProtectedRoute requiredRoles={["seller"]}>
                <ManageRestaurant />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-menu/:menuId/details"
            element={
              <ProtectedRoute requiredRoles={["seller"]}>
                <MyMenuDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/update-menu"
            element={
              <ProtectedRoute requiredRoles={["seller"]}>
                <UpdateMenu />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-list"
            element={
              <ProtectedRoute requiredRoles={["seller"]}>
                <OrderList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurant-dashboard"
            element={
              <ProtectedRoute requiredRoles={["seller"]}>
                <RestaurantDashboard />
              </ProtectedRoute>
            }
          />

          {/* Routes accessible to both roles */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute requiredRoles={["user", "seller"]}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-summary/:order_id"
            element={
              <ProtectedRoute requiredRoles={["user", "seller"]}>
                <OrderSummary />
              </ProtectedRoute>
            }
          />

          {/* Special case: User becoming a seller */}
          <Route
            path="/become-seller"
            element={
              <ProtectedRoute requiredRoles={["user"]}>
                <BecomeSeller />
              </ProtectedRoute>
            }
          />

          {/* Payment routes - potentially public with validation */}
          <Route path="/thanks" element={<Thanks />} />
          <Route path="/pay-now/:orderId" element={<PayNow />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
