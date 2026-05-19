const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/verifyToken');
const Room = require('../models/Room');

// POST /api/rooms/create
router.post('/create', authMiddleware, async (req, res) => {
    try {
        const { password, format } = req.body;

        const newRoom = await Room.create({
            host: req.user.id,
            whitePlayer: req.user.id,
            password: password || '',
            format: format || 'rapid',
        });

        res.status(201).json({ roomId: newRoom.roomId });  
    } catch (e) {
        res.status(500).json({ error: 'Server error' });
    }
});


router.post('/join', authMiddleware, async (req, res) => {
    try {
        const { roomId, password } = req.body;
        const userId = req.user.id;

        const room = await Room.findOne({ roomId });  
        if (!room) {
            return res.status(404).json({ error: 'Room not found.' });
        }
        if (room.password && room.password !== password) {
            return res.status(401).json({ error: 'Incorrect room password.' });
        }

        let role = 'spectator';
        if (!room.blackPlayer && room.host.toString() !== userId) {
            room.blackPlayer = userId;
            role = 'black';
        } else if (
            room.host.toString() !== userId &&
            room.whitePlayer?.toString() !== userId &&
            room.blackPlayer?.toString() !== userId &&
            !room.spectators.includes(userId) &&
            room.spectators.length < 4
        ) {
            room.spectators.push(userId);
        }

        await room.save();
        res.json({ role, roomId: room.roomId });  
    } catch (e) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/:roomId', authMiddleware, async (req, res) => {
    try {
        const room = await Room.findOne({ roomId: req.params.roomId })  
            .select('-password')
            .populate('host', 'username elo avatar')
            .populate('whitePlayer', 'username elo avatar')
            .populate('blackPlayer', 'username elo avatar')
            .populate('spectators', 'username avatar');

        if (!room) {
            return res.status(404).json({ error: 'Room not found.' });
        }
        res.json(room);
    } catch (e) {
        res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;