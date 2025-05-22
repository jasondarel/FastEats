import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
    restaurantId: {
        type: Number,
        ref: 'Restaurant',
        required: true
    },
    userId: {
        type: Number,
        ref: 'User',
        required: true
    },
    orderId: {
        type: Number,
        ref: 'Order',
        required: true
    },
    orderReference: { type: String, default: null },
    
    isInquiry: {
        type: Boolean,
        default: false
    },
    
    lastMessage: {
        text: { type: String, default: '' },
        sender: { type: String, enum: ['user', 'restaurant'], required: true },
        timestamp: { type: Date, default: Date.now }
    },
    
    unreadCountUser: { type: Number, default: 0 },
    unreadCountRestaurant: { type: Number, default: 0 },
    
    status: { 
        type: String, 
        enum: ['active', 'archived', 'resolved'], 
        default: 'active' 
    },
    
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    },
    
    sender: {
        type: { 
        type: String, 
        enum: ['user', 'restaurant'], 
        required: true 
        },
        id: {
        type: Number,
        required: true
        }
    },
    
    messageType: { 
        type: String, 
        enum: ['text', 'image', 'order_update', 'system'], 
        default: 'text' 
    },
    text: { type: String, required: true },
    attachments: [{
        type: { type: String, enum: ['image', 'file'] },
        url: { type: String, required: true },
        name: { type: String },
        size: { type: Number }
    }],
    
    readBy: {
        user: {
        isRead: { type: Boolean, default: false },
        readAt: { type: Date, default: null }
        },
        restaurant: {
        isRead: { type: Boolean, default: false },
        readAt: { type: Date, default: null },
        }
    },
    
    orderUpdate: {
        status: { type: String },
        estimatedTime: { type: Number }
    },
    
    deliveredAt: { type: Date, default: null }
}, { timestamps: true });

// Create indexes for performance
chatSchema.index({ restaurantId: 1, updatedAt: -1 });
chatSchema.index({ userId: 1, updatedAt: -1 });
chatSchema.index({ orderId: 1 });
chatSchema.index({ status: 1, updatedAt: -1 });

messageSchema.index({ chatId: 1, createdAt: 1 });
messageSchema.index({ 'sender.id': 1, 'sender.type': 1 });
messageSchema.index({ createdAt: 1 });

// Compound unique index to ensure one conversation per user-restaurant pair
chatSchema.index({ userId: 1, restaurantId: 1 }, { unique: false });
chatSchema.index({orderIdId: 1, restaurantId: 1, userId: 1}, { unique: true });

// Export models
export const Chat = mongoose.model('Chat', chatSchema);
export const Message = mongoose.model('Message', messageSchema);