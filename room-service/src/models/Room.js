const { mongoose } = require('../config/db');

const RoomSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    tags: { type: [String] },
    isPrivate: { type: Boolean, default: false, required: true },
    createdAt: { type: Date, default: Date.now, required: true },
    lastMessage: { type: mongoose.Schema.Types.ObjectId },
    lastSeqNumber: { type: Number, required: true },
    participants: [{
        userId: { type: Number, required: true },
        username: { type: String, required: true },
        admin: { type: Boolean, default: false }
    }],
    activeParticipants: [{
        userId: { type: Number, required: true },
        username: { type: String, required: true },
        admin: { type: Boolean, default: false }
    }]
});

const Room = mongoose.model('Room', RoomSchema);

module.exports = Room;
