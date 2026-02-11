const sequelize = require('./config/database');
const MessMember = require('./models/MessMember');
const User = require('./models/User');

async function activatePendingMembers() {
    try {
        await sequelize.authenticate();
        console.log('✓ Database connected\n');

        // Find all pending members
        const pendingMembers = await MessMember.findAll({
            where: { status: 'pending' }
        });

        console.log(`Found ${pendingMembers.length} pending member(s)\n`);

        if (pendingMembers.length === 0) {
            console.log('No pending members to activate.');
            return;
        }

        // Show pending members
        console.log('=== PENDING MEMBERS ===');
        for (const member of pendingMembers) {
            const user = await User.findByPk(member.user_id);
            console.log(`  - ${user?.name || 'Unknown'} (User ID: ${member.user_id}, Mess ID: ${member.mess_id})`);
        }

        console.log('\nActivating all pending members...\n');

        // Update all to active
        const [updatedCount] = await MessMember.update(
            { status: 'active' },
            { where: { status: 'pending' } }
        );

        console.log(`✓ Successfully activated ${updatedCount} member(s)`);

        // Verify
        const activeMembers = await MessMember.findAll({
            where: { status: 'active' }
        });

        console.log('\n=== ALL ACTIVE MEMBERS NOW ===');
        for (const member of activeMembers) {
            const user = await User.findByPk(member.user_id);
            console.log(`  - ${user?.name || 'Unknown'} (User ID: ${member.user_id})`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

activatePendingMembers();
