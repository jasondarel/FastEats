import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import React from "react";
import MenuPage from "./pages/MenuPage";
import BecomeSeller from "./pages/BecomeSeller";
import ManageRestaurant from "./pages/ManageRestaurant";
import MyMenuPage from "./pages/MyMenu";
import Cart from "./pages/Cart";
import MenuDetails from "./pages/MenuDetails";
import MyMenuDetails from "./pages/MyMenuDetails";
import UpdateMenu from "./pages/UpdateMenu";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import OrderList from "./pages/OrderList";
import "flowbite";
import OrderPreparingPage from "./pages/OrderPreparingPage";
import OrderDeliveringPage from "./pages/OrderDeliveringPage";
import OrderCompletedPage from "./pages/OrderCompletedPage";
import Payment from "./pages/Thanks";
import Thanks from "./pages/Thanks";

function App() {
  return (
    <div className="flex">
      <div className="flex-1">
        <Routes>
          {/* Redirect "/" to "/home" */}
          <Route path="/" element={<Navigate to="/home" />} />
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Protected Routes (Require Login) */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurant/:restaurantId/menu"
            element={
              <ProtectedRoute>
                <MenuPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-menu"
            element={
              <ProtectedRoute>
                <MyMenuPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/become-seller"
            element={
              <ProtectedRoute>
                <BecomeSeller />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-restaurant"
            element={
              <ProtectedRoute>
                <ManageRestaurant />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu-details/:menuId"
            element={
              <ProtectedRoute>
                <MenuDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-menu/:menuId/details"
            element={
              <ProtectedRoute>
                <MyMenuDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/update-menu"
            element={
              <ProtectedRoute>
                <UpdateMenu />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route path="/order/:orderId" element={<OrderDetails />} />
          <Route
            path="/order-status/preparing-order"
            element={
              <ProtectedRoute>
                <OrderPreparingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-status/delivering-order"
            element={
              <ProtectedRoute>
                <OrderDeliveringPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-status/completed-order"
            element={
              <ProtectedRoute>
                <OrderCompletedPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/thanks"
            element={
                <Thanks />
            }
          />
          <Route
            path="/order-list"
            element={
              <ProtectedRoute>
                <OrderList />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
