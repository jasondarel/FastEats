/* eslint-disable react/prop-types */

const ChatSectionHeader = ({ title, count, isActive = true }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className={`text-xl font-semibold flex items-center ${
        isActive ? 'text-gray-800' : 'text-gray-600'
      }`}>
        <div className={`w-3 h-3 rounded-full mr-3 ${
          isActive 
            ? 'bg-green-500 animate-pulse' 
            : 'bg-gray-400'
        }`}></div>
        {title} ({count})
      </h3>
    </div>
  );
};

export default ChatSectionHeader;