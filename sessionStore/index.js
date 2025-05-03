const collection = require("../config/mongoDB").getNewCollection("session");

const generateSessionID = () => {
    return Math.random().toString(36).substr(2, 9);
}

const exitSessionId = async (sessionID) => {
    const res = await collection.find({user_id: sessionID}).toArray();
    return res.length > 0;
}

const exitUserID = async (user_id) => {
    const res = await collection.find(
        {user_id: user_id}
    ).toArray();
    if (res.length === 0) {
        return 0
    } else {
        return res[0]
    }
}

const getUserID = async (sessionID) => {
    // console.log(sessionID)
    const res = await collection.find({
        sessionID: sessionID,
        status: true
    }).toArray()
    try {
        // 检查是否有匹配的文档
        if (res.length === 0) {
            throw new Error('No matching document found');
        }

        // 检查文档中是否有user_id字段
        if (!res[0].user_id) {
            throw new Error('user_id field is missing');
        }

        return res[0].user_id;
    } catch (e) {
        console.error(e)
    }
}

const storeSession = async (session) => {
    await collection.insertOne(session)
}

const createSessionService = async (email,date) => {
    if(await checkSessionUsable(email)) {
        return {message:"login success",status:200}
    }
    return await createSessionWithEmail(email,date);
}

const checkSessionUsable = async (email) => {
    const result = await collection.find({email:email,status: true}).toArray();
    return result.length > 0 ;
}

const getSessionId = async (email) => {

    const result = await collection.find({email:email,status:true}).toArray()
    if(result.length === 0)
        throw new Error("not fund session")
    return result[0].sessionID
}


module.exports = {
    generateSessionID,
    exitSessionId,
    storeSession,
    exitUserID,
    getUserID,
    createSessionService,
    getSessionId
}