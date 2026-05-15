const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middlewares/verifyToken');

router.get('/profile', authMiddleware, async (req, res) => {
    try{
        const user = await User.findById(req.user.id)
            .select('-password')
            .populate('matchHistory');
        
        if(!user) return res.status(404).json({message: 'User not found'})
            res.json(user)
    }

    catch(err){
        console.error(err);
        res.status(500).json({message: 'Server error'});

    }
})

router.get('/leaderboard',  async (req, res) =>  {
    try{
        const users = await User.find(req.params.id)
            .select("-password")
            .populate("matchHistory")
    

        if(!users){
            return res.status(404).json({message:'No user found'})};
        res.json(user)
    }
    catch(err){
        console.error(err)
        res.status(500).json({message: 'Server error'});

    }
});

module.exports = router;


