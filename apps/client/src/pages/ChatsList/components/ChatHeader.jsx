/* eslint-disable react/prop-types */
import { FaComments, FaComment } from "react-icons/fa";

const ChatHeader = ({ userRole }) => {
  return (
    <div className="w-full max-w-6xl">
      <h2 className="text-2xl md:text-3xl font-bold text-yellow-600 mb-4 flex items-center">
        <FaComments className="mr-3" /> My Chats
      </h2>

      <div className="mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200">
        <div className="flex items-center">
          <FaComment className="text-yellow-500 text-xl mr-3" />
          <div>
            {userRole === "seller" ? (
              <>
                <h3 className="font-medium">Chat with Customers</h3>
                <p className="text-sm text-gray-600">
                  Communicate with customers about your active orders that
                  are being prepared
                </p>
              </>
            ) : (
              <>
                <h3 className="font-medium">Chat with Restaurants</h3>
                <p className="text-sm text-gray-600">
                  Communicate with restaurants about your active orders that
                  are being prepared
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;