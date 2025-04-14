const SeatsCollection = require('../../config/mongoDB').getNewCollection('seats');

const getSpecificUserOrderHistory = async (email) => {
    const results = await SeatsCollection.find({email:email}).toArray();

    if(results.length === 0)
        return {status:401, message:"no order history"};

    return {status:200, message:results};
}

module.exports = {
    getSpecificUserOrderHistory
}