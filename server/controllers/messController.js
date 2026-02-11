const Mess = require('../models/Mess');
const MessMember = require('../models/MessMember');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// Create a new Mess
const createMess = async (req, res) => {
    try {
        const { name, rules } = req.body;
        const userId = req.user.id;

        const existingMember = await MessMember.findOne({ where: { user_id: userId, status: 'active' } });
        if (existingMember) {
            return res.status(400).json({ message: 'You are already a member of a mess' });
        }

        const unique_code = Math.random().toString(36).substring(2, 8).toUpperCase();

        const newMess = await Mess.create({
            name,
            unique_code,
            admin_id: userId,
            rules
        });

        await MessMember.create({
            mess_id: newMess.id,
            user_id: userId,
            status: 'active'
        });

        res.status(201).json({ message: 'Mess created successfully', mess: newMess });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Join a Mess
const joinMess = async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.user.id;

        const mess = await Mess.findOne({ where: { unique_code: code } });
        if (!mess) {
            return res.status(404).json({ message: 'Invalid Mess Code' });
        }

        const existingMember = await MessMember.findOne({ where: { user_id: userId, mess_id: mess.id } });
        if (existingMember) {
            if (existingMember.status === 'active') return res.status(400).json({ message: 'Already a member' });
            if (existingMember.status === 'pending') return res.status(400).json({ message: 'Request already pending' });
        }

        await MessMember.create({
            mess_id: mess.id,
            user_id: userId,
            status: 'pending'
        });

        res.json({ message: 'Join request sent' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get My Mess Details (Fixed Logic)
const getMyMess = async (req, res) => {
    try {
        const userId = req.user.id;

        const membership = await MessMember.findOne({
            where: { user_id: userId }
        }); // Removed strict 'active' check to debug, or add it back if needed. Using loose check for now.

        if (!membership) {
            return res.json({ mess: null });
        }

        const mess = await Mess.findByPk(membership.mess_id);

        if (!mess) return res.json({ mess: null });

        const allMemberships = await MessMember.findAll({ where: { mess_id: mess.id } });

        const memberIds = allMemberships.map(m => m.user_id);
        const users = await User.findAll({
            where: { id: memberIds },
            attributes: ['id', 'name', 'email']
        });

        const membersWithStatus = users.map(u => {
            const m = allMemberships.find(m => m.user_id === u.id);
            return {
                id: u.id,
                name: u.name,
                email: u.email,
                status: m ? m.status : 'unknown'
            };
        });

        res.json({
            mess: mess,
            isAdmin: mess.admin_id === userId,
            members: membersWithStatus
        });

    } catch (error) {
        console.error("Error in getMyMess:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createMess, joinMess, getMyMess };
