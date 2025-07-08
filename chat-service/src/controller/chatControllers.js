import {
  getChatsServiceByUserId,
  getChatsServiceByRestaurantId,
  createChatService,
  getChatByIdService,
  createMessageService,
  getMessageService,
  updateLastMessageChatService,
} from "../service/chatService.js";
import {} from "../validator/chatValidators.js";
import axios from "axios";
import envInit from "../config/envInit.js";
import logger from "../config/loggerInit.js";
import { responseError, responseSuccess } from "../util/responseUtil.js";
import {
  getRestaurantByOwnerIdInformation,
  getRestaurantInformation,
} from "../../../packages/shared/apiService.js";
import { getSellerChatsUtil, getUserChatsUtil } from "../util/chatUtil.js";

envInit();

const GLOBAL_SERVICE_URL = process.env.GLOBAL_SERVICE_URL;

export const getChatsController = async (req, res) => {
  logger.info("GET CHATS CONTROLLER");
  const { userId, role } = req.user;
  const token = req.headers.authorization?.split(" ")[1];
  let finalInformation;

  try {
    if (!userId) {
      logger.warn("User ID not found in request");
      return responseError(res, 400, "User ID not found");
    }
    console.log("Role:", role);
    if (role === "user") {
      const finalInformationResponse = await getUserChatsUtil(res, {userId, role, token});
      finalInformation = finalInformationResponse.chats;
    } else {
      const finalInformationResponse = await getSellerChatsUtil(res, {userId, role, token});
      finalInformation = finalInformationResponse.chats;
      logger.info(`Get chats success: ${finalInformation.length} chats found`);
    }
    return responseSuccess(
      res,
      200,
      "Get chats success",
      "dataChats",
      finalInformation
    );
  } catch (err) {
    logger.error("Internal Server Error", err);
    return responseError(res, 500, "Internal Server Error");
  }
};

export const getChatByIdController = async (req, res) => {
  logger.info("GET CHAT BY ID CONTROLLER");
  const { userId, role } = req.user;
  const { chat_id } = req.params;
  const token =
    req.headers.authorization?.split(" ")[1] || req.headers.authorization;
  let credentialId;
  try {
    const chat = await getChatByIdService(chat_id);
    if (!chat.success) {
      logger.warn("Chat not found");
      return responseError(res, 404, "Chat not found");
    }
    const chatData = chat.chat;

    if (role === "user") {
      credentialId = userId;
      if (credentialId !== userId) {
        logger.warn("Unauthorized access to chat");
        return responseError(res, 403, "Unauthorized access to chat");
      }
    } else {
      const restaurant = await axios.get(
        `${GLOBAL_SERVICE_URL}/restaurant/restaurant/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!restaurant.data.success) {
        logger.warn("Restaurant not found");
        return responseError(res, 404, "Restaurant not found");
      }
      credentialId =
        chatData.restaurantId || restaurant.data.restaurant.restaurant_id;

      if (credentialId !== chatData.restaurantId) {
        logger.warn("Unauthorized access to chat");
        return responseError(res, 403, "Unauthorized access to chat");
      }
    }

    if (!credentialId) {
      logger.warn("Credential ID not found");
      return responseError(res, 400, "Credential ID not found");
    }

    const orderResponse = await axios.get(
      `${GLOBAL_SERVICE_URL}/order/order-items/${chatData.orderId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const itemsWithMenu = await Promise.all(
      orderResponse.data.order.items.map(async (item) => {
        try {
          const menuResponse = await axios.get(
            `${GLOBAL_SERVICE_URL}/restaurant/menu-by-id/${item.menu_id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          return {
            ...item,
            menuDetails: menuResponse.data.menu,
          };
        } catch (error) {
          logger.warn(
            `Failed to fetch menu for item ${item.menu_id}:`,
            error.message
          );
          return {
            ...item,
            menuDetails: null,
          };
        }
      })
    );

    const chatDataWithDetails = {
      ...(chatData.toObject ? chatData.toObject() : chatData),
      orderDetails: {
        ...orderResponse.data.order,
        items: itemsWithMenu,
      },
    };

    logger.info("Get chat by ID success");
    return responseSuccess(
      res,
      200,
      "Get chat by ID success",
      "dataChat",
      chatDataWithDetails
    );
  } catch (err) {
    logger.error("Internal Server Error", err);
    return responseError(res, 500, "Internal Server Error");
  }
};

export const createChatController = async (req, res) => {
  logger.info("CREATE CHAT CONTROLLER");
  const { orderId } = req.body;
  const token =
    req.headers.authorization?.split(" ")[1] || req.headers.authorization;
  try {
    const order = await axios.get(
      `${GLOBAL_SERVICE_URL}/order/order-items/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const chat = await createChatService({
      orderId: order.data.order.order_id,
      restaurantId: order.data.order.restaurant_id,
      userId: order.data.order.user_id,
    });
    if (!chat.success) {
      logger.warn("Chat creation failed");
      return responseError(res, 400, "Chat creation failed");
    }
    logger.info("Create chat controller");
    return responseSuccess(res, 200, "Get order success", "dataChat", chat);
  } catch (err) {
    logger.error("Internal Server Error", err);
    return responseError(res, 500, "Internal Server Error");
  }
};

export const createMessageController = async (req, res) => {
  logger.info("CREATE MESSAGE CONTROLLER");
  const token =
    req.headers.authorization?.split(" ")[1] || req.headers.authorization;
  const { role, userId } = req.user;
  let sender;
  const { chatId, messageType, text, imageUrl, gifData, gifUrl, gifTitle } =
    req.body;
  const io = req.app.get("io");
  let textMessage = text || "";
  let attachments = null;

  try {
    if (messageType === "image") {
      if (!chatId) {
        logger.warn("Chat ID or text not provided");
        return responseError(res, 400, "Chat ID and text are required");
      }
      attachments = {
        type: "image",
        url: imageUrl,
        name: imageUrl.split("/").pop(),
        size: 0,
      };
    } else if (messageType === "order_details") {
      if (!chatId) {
        logger.warn("Chat ID is required for order update");
        return responseError(res, 400, "Chat ID is required");
      }
    } else {
      if (!chatId || !text) {
        logger.warn("Chat ID or text not provided");
        return responseError(res, 400, "Chat ID and text are required");
      }
    }

    if (role === "user") {
      sender = { type: "user", id: userId };
    } else {
      const restaurant = await getRestaurantByOwnerIdInformation(
        GLOBAL_SERVICE_URL,
        userId,
        token
      );
      if (!restaurant) {
        logger.warn("Restaurant not found");
        return responseError(res, 404, "Restaurant not found");
      }
      sender = { type: "restaurant", id: restaurant.restaurant.restaurant_id };
    }
    const newMessage = await createMessageService({
      chatId,
      userId,
      text: textMessage,
      sender,
      attachments: attachments || null,
      messageType: messageType || "text",

      gifData: messageType === "gif" ? gifData : undefined,
      gifUrl: messageType === "gif" ? gifUrl : undefined,
      gifTitle: messageType === "gif" ? gifTitle : undefined,

      orderDetails:
        messageType === "order_details" ? req.body.orderDetails : undefined,
    });

    if (!newMessage.success) {
      logger.warn("Message creation failed");
      return responseError(res, 400, "Message creation failed");
    }

    await updateLastMessageChatService(chatId, {
      text: textMessage,
      sender: sender.type,
      messageType: messageType || "text",
      timestamp: new Date(),
    });

    console.log("messageType:", messageType);

    if (io) {
      const messageData = {
        ...newMessage.message,
        chatId,
        sender,
        createdAt: new Date().toISOString(),
      };
      const objectMessage = messageData.toObject
        ? newMessage.message.toObject()
        : newMessage.message;
      
      const updatedChat = await getChatByIdService(chatId);
      if (!updatedChat) {
        logger.warn("Chat not found for emitting new message");
        return responseError(res, 404, "Chat not found");
      }

      io.to(`chat_${chatId}`).emit("new_message", objectMessage);
      logger.info(`WebSocket: Emitted new_message event to all clients`);

      io.emit("refresh_chat_list", {
        updatedChat: updatedChat.chat,
      })

      io.to(`user_${sender.id}`).emit("update_chat", {
        chatId,
        lastMessage: {
          text,
          sender,
          timestamp: new Date().toISOString(),
        },
      });

      logger.info(`WebSocket: Emitted new_message event to chat_${chatId}`);
    } else {
      logger.warn("WebSocket: io instance not available");
    }

    logger.info("Create message controller");
    return responseSuccess(
      res,
      200,
      "Message created successfully",
      "dataMessage",
      newMessage.message
    );
  } catch (err) {
    logger.error("Error determining sender information", err);
    return responseError(res, 500, "Internal Server Error");
  }
};

export const getMessageController = async (req, res) => {
  logger.info("GET MESSAGE CONTROLLER");
  const { userId, role } = req.user;
  const { chatId } = req.query;
  try {
    const chat = await getChatByIdService(chatId);
    if (!chat.success) {
      logger.warn("Chat not found");
      return responseError(res, 404, "Chat not found");
    }

    if (role === "user") {
      if (chat.chat.userId !== userId) {
        logger.warn("Unauthorized access to chat messages");
        return responseError(res, 403, "Unauthorized access to chat messages");
      }
    } else {
      console.log("Restaurant triggered");
      const restaurant = await getRestaurantByOwnerIdInformation(
        GLOBAL_SERVICE_URL,
        userId,
        req.headers.authorization
      );
      if (!restaurant) {
        logger.warn("Restaurant not found");
        return responseError(res, 404, "Restaurant not found");
      }

      if (chat.chat.restaurantId !== restaurant.restaurant.restaurant_id) {
        logger.warn("Unauthorized access to chat messages");
        return responseError(res, 403, "Unauthorized access to chat messages");
      }
    }

    const message = await getMessageService(chatId);
    if (!message.success) {
      logger.warn("Message not found");
      return responseError(res, 404, "Message not found");
    }

    logger.info("Get message success");
    return responseSuccess(
      res,
      200,
      "Get message success",
      "dataMessage",
      message.messages
    );
  } catch (err) {
    logger.error("Error retrieving message", err);
    return responseError(res, 500, "Internal Server Error");
  }
};

export const uploadImageChatController = async (req, res) => {
  logger.info("UPLOAD IMAGE CHAT CONTROLLER");
  const { chatId } = req.body;
  const token =
    req.headers.authorization?.split(" ")[1] || req.headers.authorization;

  if (!chatId) {
    logger.warn("Chat ID not provided");
    return responseError(res, 400, "Chat ID is required");
  }

  if (!req.file) {
    logger.warn("No file uploaded");
    return responseError(res, 400, "No file uploaded");
  }

  try {
    const baseUrl = GLOBAL_SERVICE_URL.endsWith("/")
      ? GLOBAL_SERVICE_URL.slice(0, -1)
      : GLOBAL_SERVICE_URL;
    const imageUrl = `${baseUrl}/chat/uploads/chat/${req.file.filename}`;

    logger.info("Image uploaded successfully", imageUrl);

    const io = req.app.get("io");
    if (io) {
      io.to(`chat_${chatId}`).emit("new_message", {
        chatId,
        imageUrl,
        createdAt: new Date().toISOString(),
        sender: { type: "user", id: req.user.userId },
      });
      logger.info(
        `WebSocket: Emitted new_message event for image upload to chat_${chatId}`
      );
    } else {
      logger.warn("WebSocket: io instance not available");
    }

    return responseSuccess(
      res,
      200,
      "Image uploaded successfully",
      "imageUrl",
      imageUrl
    );
  } catch (error) {
    logger.error("Error uploading image", error);
    return responseError(res, 500, "Internal Server Error");
  }
};
