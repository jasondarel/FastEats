import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: Number,
      ref: "Restaurant",
      required: true,
    },
    userId: {
      type: Number,
      ref: "User",
      required: true,
    },
    orderId: {
      type: Number,
      ref: "Order",
      required: true,
      unique: true,
    },
    orderReference: { type: String, default: null },

    isInquiry: {
      type: Boolean,
      default: false,
    },

    lastMessage: {
      text: { type: String, default: "" },
      sender: {
        type: {
          type: String,
          enum: ["user", "restaurant"],
          required: true,
        },
        id: {
          type: Number,
          required: true,
        },
      },
      timestamp: { type: Date, default: Date.now },
      messageType: {
        type: String,
        enum: ["text", "image", "gif", "order_details", "system"],
      },
    },

    orderDetails: {
      type: {
        orderId: Number,
        orderType: String,
        restaurantName: String,
        restaurantImage: String,
        totalPrice: Number,
        status: {
          type: String,
          enum: ["pending", "preparing", "delivered", "cancelled"],
        },
        items: [
          {
            name: String,
            quantity: Number,
            price: Number,
            image: String,
          },
        ],
      },
      required: false,
    },

    unreadCountUser: { type: Number, default: 0 },
    unreadCountRestaurant: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["active", "archived", "resolved"],
      default: "active",
    },
  },
  { timestamps: true }
);

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },

    sender: {
      type: {
        type: String,
        enum: ["user", "restaurant"],
        required: true,
      },
      id: {
        type: Number,
        required: true,
      },
    },

    messageType: {
      type: String,
      enum: ["text", "image", "gif", "order_details", "system"],
      default: "text",
    },
    orderDetails: {
      type: {
        orderId: Number,
        orderType: String,
        restaurantName: String,
        restaurantImage: String,
        totalPrice: Number,
        status: {
          type: String,
          enum: ["pending", "preparing", "delivered", "cancelled"],
        },
        items: [
          {
            name: String,
            quantity: Number,
            price: Number,
            image: String,
          },
        ],
      },
      required: false,
    },

    orderId: {
      type: Number,
      ref: "Order",
      required: false,
    },

    text: { type: String, required: false },

    gifData: {
      id: { type: String },
      url: { type: String },
      title: { type: String },
      width: { type: Number },
      height: { type: Number },
    },
    gifUrl: { type: String },
    gifTitle: { type: String },

    attachments: {
      type: {
        fileType: { type: String, enum: ["image", "file"] },
        url: { type: String, required: true },
        name: { type: String },
        size: { type: Number },
      },
      required: false,
    },
    readBy: {
      user: {
        isRead: { type: Boolean, default: false },
        readAt: { type: Date, default: null },
      },
      restaurant: {
        isRead: { type: Boolean, default: false },
        readAt: { type: Date, default: null },
      },
    },

    deliveredAt: { type: Date, default: null },
  },
  { timestamps: true }
);

chatSchema.index({ restaurantId: 1, updatedAt: -1 });
chatSchema.index({ userId: 1, updatedAt: -1 });
chatSchema.index({ orderId: 1 }, { unique: true });
chatSchema.index({ status: 1, updatedAt: -1 });

messageSchema.index({ chatId: 1, createdAt: 1 });
messageSchema.index({ "sender.id": 1, "sender.type": 1 });
messageSchema.index({ createdAt: 1 });

export const Chat = mongoose.model("Chat", chatSchema);
export const Message = mongoose.model("Message", messageSchema);
