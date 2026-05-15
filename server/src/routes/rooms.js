const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/verifyToken');
const Room = require('../models/Room');

router.post('/create', authMiddleware, async(req, res) => {
    try{
        const {password} = req.body;
        
        const newRoom = await Room.create({
            host: req.user.id,
            players: [req.user.id],
            password: password || '',

        });
        res.status(200).json({ roomId: newRoom._id });
    }catch(e){
        res.status(500).json({ error: 'Server error'});
    }
});

router.post('/join', authMiddleware, async (req, res) => {
    try{
        const {roomId, password} = req.body;
        const userId = req.user.id;

        const room = await Room.findById(roomId);
        if(!room){
            return res.status(404).json({error: 'Room not found.'});
        }
        if(room.password !== password){
            return res.status(401).json({error: 'Incorrect room password.'});
        }
        let role = 'spectator';
        if(room.players.length < 2 && !room.players.includes(userId)){
            room.players.push(userId);
            role = 'player';
        }else if(!room.players.includes(userId) && !room.spectators.includes(userId)){
            room.spectators.push(userId);
        }
        await room.save();
        res.json({role, roomId: room._id});
    }catch(e){
        res.status(500).json({ error: 'Server error'});
    }
});

router.get('/:roomId', authMiddleware, async (req, res) => {
    try{
        const room = await Room.findById(req.params.roomId)
            .select('-password')
            .populate('host', 'username elo avatar')
            .populate('players', 'username elo avatar')
            .populate('spectators', 'username avatar');
        if(!room){
            return res.status(404).json({ error: 'Room not found.'});
        }
        res.json(room);
    }catch(e){
        res.status(500).json({ error: 'Server error.'});
    }
});

module.exports = router;
