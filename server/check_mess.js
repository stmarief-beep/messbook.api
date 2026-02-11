const sequelize = require('./config/database');
const Mess = require('./models/Mess');
const User = require('./models/User');

async function checkMess() {
    try {
        await sequelize.authenticate();

        const latestMess = await Mess.findOne({
            order: [['createdAt', 'DESC']]
        });

        if (latestMess) {
            console.log('Latest Mess:', latestMess.toJSON());
            console.log('Unique Code:', latestMess.unique_code);
        } else {
            console.log('No messes found.');
        }

    } catch (error) {
        console.error(error);
    } finally {
        await sequelize.close();
    }
}

checkMess();
