const {checkPermissionWithUserID} = require('../../checkPermission/index')
const {getUserID} = require('../../sessionStore/index')
const { getEmailBySession } = require('../../sessionStore/checkBySessionID')
const userCollection = require('../../config/mongoDB').getNewCollection('users');

const getUserInfo = async (email) => {
    const result = await userCollection.find({
        email:email
    }).toArray();
    return result[0];
}

const changeUsername = async (username,email) => {
    await userCollection.updateOne({email:email},{$set:{username:username}});
    const result = await userCollection.find({email:email}).toArray();
    if(result[0].username !== username){
        return {status:401,message:"update error"};
    }
    return {status:200,message:"update successfully"};
}

const deleteSpecificUser = async (email) => {
    await userCollection.deleteOne({email:email});
    const result = await userCollection.find({email:email}).toArray();
    if(result.length === 0) {
        return {status:200,message:`delete ${email} user successfully`};
    }else{
        return {status:401,message:`delete ${email} user unsuccessfully`};
    }
}

module.exports = {
    getUserInfo,
    changeUsername,
    deleteSpecificUser
}