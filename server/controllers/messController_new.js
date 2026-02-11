// Simplified getMyMess
const Mess = require('../models/Mess');
const MessMember = require('../models/MessMember');
const User = require('../models/User');

const getMyMess = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find active membership
        const membership = await MessMember.findOne({
            where: { user_id: userId }
        });

        if (!membership) {
            return res.json({ mess: null });
        }

        const mess = await Mess.findByPk(membership.mess_id);

        if (!mess) return res.json({ mess: null });

        // Get members manually to avoid association errors if not set up globally
        const allMemberships = await MessMember.findAll({ where: { mess_id: mess.id } });

        const memberIds = allMemberships.map(m => m.user_id);
        const users = await User.findAll({
            where: { id: memberIds },
            attributes: ['id', 'name', 'email']
        });

        // Map status
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

module.exports = { getMyMess };
