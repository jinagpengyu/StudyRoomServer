const collection = require('../config/mongoDB').getNewCollection('session');

const checkSessionByEmail = async (email) => {
    const result = await collection.find({
        email:email,
        endDate:{
            $gt: new Date()
        }
    }).toArray();
    return result.length > 0
}

const checkSessionStatus = async (sessionID) => {
    const result = await collection.find({
        sessionID:sessionID,
        endDate:{$gte:new Date()}
    }).toArray();
    return result.length > 0;
}

const getEmailBySession = async (sessionID) => {
    const result = await collection.find({
        sessionID:sessionID,
        endDate:{$gte:new Date()}
    }).toArray();
    return result[0].email;
}

const checkSessionNotExit = async (sessionID) => {
    const result = await collection.find({sessionID: sessionID, status:true}).toArray();
    if(result.length <= 0)
        return true;
    return false;
}

const checkUserSessionStatus = async (email) => {
    const result = await collection.find({email: email, status: true}).toArray();
    return result.length > 0 ;
}

const clearSession = async (sessionID) => {
    await collection.updateOne({sessionID: sessionID},{$set : {status: false}});
    return true;
}

const createSessionWithEmail = async (email,loginDate) => {
    if( await checkUserSessionStatus(email)){
        return true;
    }
    const sessionID = Math.random().toString(36).substr(2, 9);
    const endDate = new Date(loginDate);
    endDate.setDate(endDate.getDate() + 30);
    const insertJson = {
        email:email,
        sessionID:sessionID,
        startDate: loginDate,
        endDate: endDate,
        status: true
    }
    await collection.insertOne(insertJson);
    return await checkUserSessionStatus(email);

}

module.exports = {
    checkSessionByEmail,
    checkSessionStatus,
    getEmailBySession,
    clearSession,
    checkSessionNotExit,
    checkUserSessionStatus,
    createSessionWithEmail,
}