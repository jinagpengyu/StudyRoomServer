const { getNewCollection } = require('../config/mongoDB');

const GetUserId = async (email) => {
    const userCollection = getNewCollection('users');
    const result = await userCollection.findOne({email:email})
    return result._id;
}

module.exports = {
    GetUserId,
    async GetFormatedDate(utc_date) {
        const date = new Date(utc_date)
        const utc8 = date.getTime() + date.getTimezoneOffset() * 60 * 1000;
        const chinaTime = new Date(utc8 + 8 * 60 * 60 * 1000);
        return chinaTime.toISOString().split('T')[0];
    }
}