const isSellerRole = (role) =>
  ["seller", "restaurant"].includes(String(role || "").toLowerCase());

const isCustomerRole = (role) =>
  ["user", "customer"].includes(String(role || "").toLowerCase());

export const resolveMessageSender = (sender, currentUserRole, currentUserId) => {
  if (!sender || !currentUserRole || !currentUserId) return "otherUser";

  const isCurrentUserRole = (role) =>
    currentUserRole === "seller" ? isSellerRole(role) : isCustomerRole(role);

  if (typeof sender === "object") {
    const senderRole = sender.type || sender.role;

    if (senderRole) {
      return isCurrentUserRole(senderRole) ? "currentUser" : "otherUser";
    }

    const senderId = sender.id ?? sender.userId;
    if (senderId !== undefined && senderId !== null) {
      return Number(senderId) === Number(currentUserId)
        ? "currentUser"
        : "otherUser";
    }
  } else if (typeof sender === "string") {
    return isCurrentUserRole(sender) ? "currentUser" : "otherUser";
  }

  return "otherUser";
};
