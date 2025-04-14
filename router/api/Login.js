const {mysql_pool} = require('../../config/database')
const {
    createSessionService ,
    getSessionId,

} = require('../../sessionStore/index');
const { checkUserSessionStatus , createSessionWithEmail } = require('../../sessionStore/checkBySessionID');
const collectionUsers = require('../../config/mongoDB').getNewCollection('users');

/*
* users table params :
*   user_id
*   email
*   password
*   registrationDate
*   username
* */
const loginService = async (email,password) => {
    // if(! await checkUserExit(email)){
    //     return {message:"user not exit ",status:300};
    // }
    // if(! await checkEmailMatchPassword(email,password)){
    //     return {message:"password not match email",status:301};
    // }
    if(! await checkEmailAndPassword(email,password)){
        return false;
    }
    // if(! await checkUserSessionStatus(email))
    //     await createSessionWithEmail(email,new Date());
    // if(! await checkUserSessionStatus(email))
    //     return {message:"insert session error",status: 302};
    return await createSessionWithEmail(email, new Date());

}

const checkUserExit = async (email) => {
    const res = await collectionUsers.find({email:email}).toArray();
    console.log(res);
    return res.length > 0;
}

const checkEmailMatchPassword = async (email,password) => {
    const res = await collectionUsers.find({email:email}).toArray();
    return res[0].password === password
}

const checkEmailAndPassword = async (email,password) => {
    const res = await collectionUsers.find({
        email:email
    }).toArray();
    // console.log("target password:" + res[0].password + "\n" + "password:" + password);
    if(res.length <= 0) {
        return false;
    }
    if(res[0].password !== password) {
        return false;
    }
    //test
    console.log("test: checkEmailAndPassword true");
    return true;
}

module.exports = {
    loginService
}


