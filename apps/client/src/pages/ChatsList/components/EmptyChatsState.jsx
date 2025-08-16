import { FaStore } from "react-icons/fa";

const EmptyChatsState = () => {
  return (
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
  );
};

export default EmptyChatsState;