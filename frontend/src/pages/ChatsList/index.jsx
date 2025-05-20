import { useEffect, useState } from "react";
import { FaComments, FaComment, FaStore } from "react-icons/fa";
import Sidebar from "../../components/Sidebar";
import ChatCard from "./components/ChatCard";
import LoadingState from "../../components/LoadingState";

// Dummy data for chats
const DUMMY_CHATS = [
  {
    order_id: 12345,
    order_type: "CART",
    status: "Preparing",
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    updated_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    lastMessageTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    lastMessage:
      "Your order is being prepared and will be ready in 15 minutes!",
    unreadCount: 2,
    restaurant: {
      restaurant_id: 101,
      restaurant_name: "Mama's Kitchen",
      restaurant_image: "/api/placeholder/150/150",
    },
    items: [
      { menu_id: 1, item_quantity: 2 },
      { menu_id: 2, item_quantity: 1 },
      { menu_id: 3, item_quantity: 3 },
    ],
    menu: [
      { menu_id: 1, menu_price: "25000" },
      { menu_id: 2, menu_price: "35000" },
      { menu_id: 3, menu_price: "15000" },
    ],
  },
  {
    order_id: 12346,
    order_type: "CHECKOUT",
    status: "Waiting",
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
    updated_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(), // 20 minutes ago
    lastMessageTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
    lastMessage:
      "We're working on your special request. Thanks for your patience!",
    unreadCount: 0,
    restaurant: {
      restaurant_id: 102,
      restaurant_name: "Spice Garden Restaurant",
      restaurant_image: "/api/placeholder/150/150",
    },
    item_quantity: 2,
    menu: [{ menu_id: 4, menu_price: "45000" }],
  },
  {
    order_id: 12347,
    order_type: "CART",
    status: "Completed",
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
    updated_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
    lastMessageTime: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
    lastMessage: "Your order is ready for pickup! Please come to the counter.",
    unreadCount: 1,
    restaurant: {
      restaurant_id: 103,
      restaurant_name: "Ocean Breeze Cafe",
      restaurant_image: null, // No image to test fallback icon
    },
    items: [
      { menu_id: 5, item_quantity: 1 },
      { menu_id: 6, item_quantity: 2 },
    ],
    menu: [
      { menu_id: 5, menu_price: "28000" },
      { menu_id: 6, menu_price: "22000" },
    ],
  },
  {
    order_id: 12348,
    order_type: "CHECKOUT",
    status: "Pending",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updated_at: new Date(Date.now() - 3 * 60 * 1000).toISOString(), // 3 minutes ago
    lastMessageTime: new Date(Date.now() - 3 * 60 * 1000).toISOString(), // 3 minutes ago
    lastMessage: "Thank you for your order! We'll start preparing it shortly.",
    unreadCount: 0,
    restaurant: {
      restaurant_id: 104,
      restaurant_name: "Dragon Palace Chinese",
      restaurant_image: "/api/placeholder/150/150",
    },
    item_quantity: 4,
    menu: [{ menu_id: 7, menu_price: "18000" }],
  },
  {
    order_id: 12349,
    order_type: "CART",
    status: "Preparing",
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 minutes ago
    updated_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(), // 8 minutes ago
    lastMessageTime: new Date(Date.now() - 8 * 60 * 1000).toISOString(), // 8 minutes ago
    lastMessage:
      "Chef is preparing your order with extra care! ETA: 10 minutes.",
    unreadCount: 3,
    restaurant: {
      restaurant_id: 105,
      restaurant_name: "Pizza Corner",
      restaurant_image: "/api/placeholder/150/150",
    },
    items: [
      { menu_id: 8, item_quantity: 1 },
      { menu_id: 9, item_quantity: 2 },
      { menu_id: 10, item_quantity: 1 },
    ],
    menu: [
      { menu_id: 8, menu_price: "65000" },
      { menu_id: 9, menu_price: "12000" },
      { menu_id: 10, menu_price: "8000" },
    ],
  },
];

const ChatsList = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchChats = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate potential error (uncomment to test error state)
      // throw new Error("Network error");

      // Use dummy data
      setChats(DUMMY_CHATS);
    } catch (err) {
      console.error("Error fetching chats:", err);
      setError("An error occurred while fetching chats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  // Separate active and completed chats
  const activeChats = chats.filter((chat) => chat.status !== "Completed");
  const completedChats = chats.filter((chat) => chat.status === "Completed");

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row p-4 md:p-10 w-full md:pl-64 h-screen bg-yellow-50">
        <Sidebar />
        <div className="flex flex-col flex-grow items-center w-full overflow-auto md:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="w-full max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-bold text-yellow-600 mb-4 flex items-center">
              <FaComments className="mr-3" /> My Chats
            </h2>
            <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <FaComment className="text-yellow-500 text-xl mr-3" />
                <div>
                  <h3 className="font-medium">Chat with Restaurants</h3>
                  <p className="text-sm text-gray-600">
                    Communicate with restaurants about your active orders
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full flex justify-center">
            <LoadingState />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col md:flex-row p-4 md:p-10 w-full md:pl-64 h-screen bg-yellow-50">
        <Sidebar />
        <div className="flex flex-col flex-grow items-center w-full overflow-auto md:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="w-full max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-bold text-yellow-600 mb-4 flex items-center">
              <FaComments className="mr-3" /> My Chats
            </h2>
            <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <FaComment className="text-yellow-500 text-xl mr-3" />
                <div>
                  <h3 className="font-medium">Chat with Restaurants</h3>
                  <p className="text-sm text-gray-600">
                    Communicate with restaurants about your active orders
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center py-10 px-4 bg-white rounded-lg shadow w-full max-w-6xl">
            <h3 className="text-xl font-semibold text-red-600 mb-2">Error</h3>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={fetchChats}
              className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row p-4 md:p-10 w-full md:pl-64 h-screen overflow-auto bg-yellow-50">
      <Sidebar />
      <div className="flex flex-col flex-grow w-full overflow-auto md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="w-full max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold text-yellow-600 mb-4 flex items-center">
            <FaComments className="mr-3" /> My Chats
          </h2>

          <div className="mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <FaComment className="text-yellow-500 text-xl mr-3" />
              <div>
                <h3 className="font-medium">Chat with Restaurants</h3>
                <p className="text-sm text-gray-600">
                  Communicate with restaurants about your active orders that are
                  being prepared
                </p>
              </div>
            </div>
          </div>
        </div>

        {chats.length === 0 ? (
          <div className="text-center py-10 px-4 bg-white rounded-lg shadow w-full max-w-6xl">
            <div className="mb-4 flex justify-center">
              <FaStore className="text-yellow-400 text-5xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Active Chats
            </h3>
            <p className="text-gray-600 mb-4">
              You don't have any orders that are currently being prepared.
            </p>
            <p className="text-sm text-gray-500">
              Chats are available when your orders are being prepared by
              restaurants.
            </p>
          </div>
        ) : (
          <div className="w-full max-w-6xl space-y-6">
            {/* Active Chats Section */}
            {activeChats.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Active Conversations ({activeChats.length})
                </h3>
                <div className="space-y-3">
                  {activeChats.map((chat) => (
                    <ChatCard key={chat.order_id} chat={chat} />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Chats Section */}
            {completedChats.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-600 mb-3">
                  Completed Orders ({completedChats.length})
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  These orders are completed and chat is no longer available
                </p>
                <div className="space-y-3">
                  {completedChats.map((chat) => (
                    <ChatCard key={chat.order_id} chat={chat} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatsList;
