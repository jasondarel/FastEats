import mongoose from "mongoose";
import logger from "./loggerInit.js";
import { connectDatabase } from "./dbInit.js";
import { Chat, Message } from "./schema.js";

const CONSTANTS = {
  INQUIRY_ORDER_ID: -999,
};

const initializeCollections = async () => {
  try {
    logger.info("Initializing MongoDB collections...");

    if (mongoose.connection.readyState !== 1) {
      await connectDatabase();
    }

    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    const collectionNames = collections.map((c) => c.name);

    logger.info(`Available collections: ${collectionNames.join(", ")}`);
    logger.info("✅ MongoDB collections initialized successfully!");

    createDummyData();

    return true;
  } catch (error) {
    logger.error("❌ Error initializing MongoDB collections:", error);
    return false;
  }
};

async function createDummyData() {
  try {
    // Clear existing data if needed
    await Chat.deleteMany({});
    await Message.deleteMany({});

    // Create dummy IDs
    const restaurantIds = [1, 2, 3];
    const userIds = [2, 1, 4, 5];
    const orderIds = [84, 85, 86];

    // Create dummy chats
    const chats = [
      {
        restaurantId: restaurantIds[0],
        userId: userIds[0],
        orderId: orderIds[0],
        orderReference: "ORD-001",
        isInquiry: false, // This is an order-related chat
        lastMessage: {
          text: "Is my pizza ready for pickup?",
          sender: "user",
          timestamp: new Date(Date.now() - 3600000),
        },
        unreadCountUser: 0,
        unreadCountRestaurant: 1,
        status: "active",
      },
      {
        restaurantId: restaurantIds[0],
        userId: userIds[1],
        orderId: orderIds[1],
        orderReference: "ORD-002",
        isInquiry: false, // This is an order-related chat
        lastMessage: {
          text: "Your order is ready for pickup!",
          sender: "restaurant",
          timestamp: new Date(Date.now() - 1800000),
        },
        unreadCountUser: 1,
        unreadCountRestaurant: 0,
        status: "active",
      },
      {
        restaurantId: restaurantIds[1],
        userId: userIds[2],
        orderId: orderIds[2],
        orderReference: "ORD-003",
        isInquiry: false, // This is an order-related chat
        lastMessage: {
          text: "We're preparing your order now!",
          sender: "restaurant",
          timestamp: new Date(Date.now() - 900000),
        },
        unreadCountUser: 2,
        unreadCountRestaurant: 0,
        status: "active",
      },
      {
        restaurantId: restaurantIds[2],
        userId: userIds[3],
        orderId: CONSTANTS.INQUIRY_ORDER_ID, // Use the special inquiry order ID
        orderReference: "INQUIRY",
        isInquiry: true, // This is a general inquiry, not order-related
        lastMessage: {
          text: "Do you have gluten-free options?",
          sender: "user",
          timestamp: new Date(Date.now() - 86400000),
        },
        unreadCountUser: 0,
        unreadCountRestaurant: 1,
        status: "archived",
      },
    ];

    // Insert chats
    const savedChats = await Chat.insertMany(chats);
    console.log(`Created ${savedChats.length} dummy chats`);

    // Rest of your message creation code...
  } catch (error) {
    console.error("Error creating dummy data:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

export { initializeCollections };
