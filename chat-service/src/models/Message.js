const { mongoose } = require('../configs/db');

const Room = mongoose.model('Room', RoomSchema);

const MessageSchema = new mongoose.Schema({
    sender: { type: Number, required: true },
    senderName: { type: String, required: true},
    content: { type: String, required: true },
    mentions: { type: [Number] }, // Apply special notification setting. 
    timestamp: { type: Date, default: Date.now, required: true }, 
    edited: { type: Boolean, default: false, required: true },
    deletedBy: { type: [Number] }, // Deletion is not global.
    flagged: { type: Boolean, default: false },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    sequenceNumber: { type: Number, required: true },
    // unreadCount: { type: Number, required: true }
});

