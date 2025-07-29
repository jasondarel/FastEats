/* eslint-disable react/prop-types */
import ChatCard from "./ChatCard";
import ChatSectionHeader from "./ChatSectionHeader";

const ChatListSection = ({ 
  chats, 
  title, 
  isActive = true, 
  userRole, 
  chatRefs,
  showNotice = false 
}) => {
  if (chats.length === 0) return null;

  return (
    <div>
      <ChatSectionHeader 
        title={title} 
        count={chats.length} 
        isActive={isActive} 
      />
      <div className="space-y-3">
        {chats.map((chat) => {
          const chatId = chat.chat_id || chat.order_id;
          return (
            <div
              key={chatId}
              ref={(el) => {
                if (el) {
                  chatRefs.current.set(chatId, el);
                } else {
                  chatRefs.current.delete(chatId);
                }
              }}
              className="relative"
            >
              <ChatCard
                chat={chat}
                role={userRole}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatListSection;