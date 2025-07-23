import { FaComment } from "react-icons/fa";

const CompletedChatsNotice = () => {
  return (
    <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <p className="text-sm text-gray-600 flex items-center">
        <FaComment className="text-gray-400 mr-2" />
        These orders are completed and chat is no longer available
      </p>
    </div>
  );
};

export default CompletedChatsNotice;