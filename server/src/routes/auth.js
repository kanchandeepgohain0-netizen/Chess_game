const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { error } = require('node:console');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

router.post('/register', async(req,res) =>{
    try{
        const {username, email, password} = req.body;

        if(!username || !email || !password){
            return res.status(400).json({error: 'Please provide username, email and password.'});
        }
        const existingUser = await User.findOne({ $or: [{email},{username}]});
        if(existingUser){
            return res.status(409).json({error: 'Username or email exists.'});
        }

        const hashed = await bcrypt.hash(password, 12);
        const user = await User.create({username, email, password:hashed});
        const token = jwt.sign({id: user._id,username}, JWT_SECRET, {expiresIn: '7d'});

        res.status(201).json({token, userId: user._id, username: user.username, elo: user.elo});
    }catch(e){
        console.error("Registration Error:",e);
        res.status(500).json({error: 'Internal server error.'});
    }
});

router.post('/login',async(req,res) => {
    try{
        const {email,password} = req.body;

        if(!email || !password){
            return res.status(400).json({error: 'Please provide email and password.'});
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({error: 'User not found.'});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!ismatch){
            return res.status(401).json({error: 'Invalid credentials.'});
        }
        const token = jwt.sign({username: user.username, id: user._id}, JWT_SECRET, {expiresIn: '7d'});
        res.status(200).json({token, userId: user._id, username: user.username, elo: user.elo});
    }catch(e){
        console.error("Login error:",e);
        res.status(500).json({error: 'Internal server error.'});
    }
});

module.exports = router;
