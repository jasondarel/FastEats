/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home/index";
import Login from "./pages/Login";
import GoogleAuthCallback from "./pages/Login/components/GoogleAuthCallback";
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
import ForgotPassword from "./pages/ForgotPassword";
import NewPassword from "./pages/NewPassword";
import ForgotPasswordOtp from "./pages/ForgotPasswordOtp";
import ChatsList from "./pages/ChatsList";
import ChatRoom from "./pages/ChatRoom";
import ResetPassword from "./pages/ResetPassword";
import About from "./pages/About";

function App() {
  return (
    <div className="flex">
      <div className="flex-1">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/otp-verification" element={<OtpVerifPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/forgot-password-otp" element={<ForgotPasswordOtp />} />
          <Route path="/new-password" element={<NewPassword />} />
          <Route path="/about" element={<About />} />
          <Route path="/auth/google/success" element={<GoogleAuthCallback />} />
          <Route
            path='/auth/google/error'
            element={
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Failed</h2>
                  <p className="text-gray-600 mb-4">There was an error with Google authentication</p>
                  <a href="/login" className="text-blue-600 hover:underline">Return to Login</a>
                </div>
              </div>
            }
          />

          

          <Route
            path="/"
            element={
              <ProtectedRoute requiredRoles={["user"]}>
                <Home />
              </ProtectedRoute>
            }
          />
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
            path="/chat"
            element={
              <ProtectedRoute requiredRoles={["user", "seller"]}>
                <ChatsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:chatId"
            element={
              <ProtectedRoute requiredRoles={["user", "seller"]}>
                <ChatRoom />
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

          <Route
            path="/become-seller"
            element={
              <ProtectedRoute requiredRoles={["user"]}>
                <BecomeSeller />
              </ProtectedRoute>
            }
          />

          <Route path="/thanks" element={<Thanks />} />
          <Route path="/pay-now/:orderId" element={<PayNow />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
