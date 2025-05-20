import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
    sender_id: {
        type: Number,
        required: true
    },
    receiver_id: {
        type: Number,
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    read: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now
    }
    }, {
    timestamps: { 
        createdAt: 'created_at',
        updatedAt: false
    }
});

const chatRoomSchema = new mongoose.Schema({
    user_id_1: {
        type: Number,
        required: true
    },
    user_id_2: {
        type: Number,
        required: true
    },
    last_message: {
        type: String,
        default: ''
    },
    last_message_time: {
        type: Date,
        default: Date.now
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
    }, {
    timestamps: { 
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

export const Chat = mongoose.model('Chat', chatSchema);
export const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);