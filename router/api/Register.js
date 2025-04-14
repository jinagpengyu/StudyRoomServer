
const { getNewCollection }  = require("../../config/mongoDB")
const { allocateUserPermission } = require('../../permission')
const userRole = {
    user:"user_role",
    admin:"admin_role"
};
/*
* users table params :
*   user_id
*   email
*   password
*   registrationDate
*   username
* */
const collection = getNewCollection("users");

// const RegisterService = async (email,password,username,registerDate) => {
//     const collection = getNewCollection("users");
//     if(await checkUserExitInMongoDB(email)) {
//         return {message : "user have exit",status:300}
//     }
//     if(!await createNewUser(email,password,username,registerDate)) {
//         return {message : "create new user error",status:301}
//     }
//     return {message : "register successfully",status:200}
// }
const RegisterService = async (userData) => {
    const usersCollection = getNewCollection("users");
    if(await checkUserExitInMongoDB(userData.email)){
        return {message : "user have exit",status:300}
    }
    if(await CreateNewUser(userData)) {
        return {message : "create user successfully",status:200}
    }else{
        return {message : "create user error",status:301}
    }
}
/*
*
* */
const checkUserExitInMongoDB = async (email) => {

    const res = await collection.find({email:email}).toArray();
    console.log(res)
    return res.length > 0;

}

const createNewUser = async (email,password,username,registerDate) => {
    const insertJson = {
        email:email,
        password:password,
        username:username,
        registerDate: new Date(registerDate)
    }
    await collection.insertOne(insertJson);
    await allocateUserPermission(email);
    return await checkUserExitInMongoDB(email);
}
const CreateNewUser = async (userData) => {
    const insertJson = {
        name:userData.name,
        email:userData.email,
        phone:userData.phone,
        password:userData.password,
        role:userRole.user,
        create_time:new Date().getTime()
    }
    const usersCollection = getNewCollection("users");
    await usersCollection.insertOne(insertJson);
    if(await checkUserExitInMongoDB(userData.email)){
        return true;
    }else{
        return false;
    }

}

module.exports = {
    RegisterService
}
