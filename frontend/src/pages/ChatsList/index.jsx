import { useEffect, useState } from "react";
import { FaComments, FaComment, FaStore } from "react-icons/fa";
import Sidebar from "../../components/Sidebar";
import ChatCard from "./components/ChatCard";
import LoadingState from "../../components/LoadingState";
import { getChatsService } from "../../service/chatServices/chatsListService";
import { useSelector } from "react-redux";

const ChatsList = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);

  const fetchChats = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get user ID from local storage or auth context
      const token = localStorage.getItem('token');
      
      // Call the service to get the chats
      const response = await getChatsService(token);
  
      if (response.success) {
        console.log("Fetched chats:", response.dataChats);
        // Based on your backend response format
        setChats(response?.dataChats || []);
      } else {
        throw new Error(response.message || "Failed to fetch chats");
      }
    } catch (err) {
      console.error("Error fetching chats:", err);
      setError("An error occurred while fetching chats: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  // Transform MongoDB chat data to match your UI component's expected format
  const transformedChats = chats.map(chat => ({
    order_id: chat.orderId || -1,
    order_type: chat.orderReference ? "CHECKOUT" : "CART",
    status: chat.status === "active" ? "Preparing" : 
           chat.status === "resolved" ? "Completed" : 
           "Waiting",
    created_at: chat.createdAt,
    updated_at: chat.updatedAt,
    lastMessageTime: chat.lastMessage?.timestamp || chat.updatedAt,
    lastMessage: chat.lastMessage?.text || "No messages yet",
    unreadCount: chat.unreadCountUser || 0,
    restaurant: {
      restaurant_id: chat.restaurant?.restaurant_id,
      restaurant_name: chat.restaurant?.restaurant_name || "Restaurant",
      restaurant_image: chat.restaurant?.restaurant_image || null,
      restaurant_address: chat.restaurant?.restaurant_address || "Address not available",
    },
    user: chat.user || null
  }));
  const activeChats = transformedChats.filter(chat => chat.status !== "Completed");
  const completedChats = transformedChats.filter(chat => chat.status === "Completed");

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
                  {user?.role === "seller" ? (
                    <h3 className="font-medium">Chat with Users</h3>
                  ) : (
                    <h3 className="font-medium">Chat with Restaurants</h3>
                  )}
                  
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
                {user?.role === "seller" ? (
                    <>
                      <h3 className="font-medium">Chat with Customers</h3>
                      <p className="text-sm text-gray-600">
                        Communicate with customers about your active orders that are
                        being prepared
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="font-medium">Chat with Restaurants</h3>
                      <p className="text-sm text-gray-600">
                        Communicate with restaurants about your active orders that are
                        being prepared
                      </p>
                    </>
                  )}
              </div>
            </div>
          </div>
        </div>

        {transformedChats.length === 0 ? (
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
                    <ChatCard 
                    key={chat.order_id} 
                    chat={chat}
                    role={user?.role} />
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