const collection = require('../config/mongoDB').getNewCollection('user_role');
const allocateUserPermission = async (email) => {
    const insertJson ={
        email:email,
        role:'user',
        permissions:['view']
    }
    await collection.insertOne(insertJson)
    if(! await checkUserCreated(email))
        throw new Error("User Permissions not created")
    return true
}

const checkUserCreated = async (email) => {
    const result = await collection.find({email:email}).toArray();
    return result.length > 0;
}

module.exports = {
    allocateUserPermission
}