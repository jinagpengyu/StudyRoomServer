const express = require('express');
const { ObjectId } = require('mongodb')

const indexRouter = express.Router();

const LoginApi = require('./api/Login');

const { checkSessionStatus , clearSession, checkSessionNotExit , checkUserSessionStatus} = require("../sessionStore/checkBySessionID");

const { getSessionId } = require('../sessionStore/index');

const { getUserInfo, changeUsername, deleteSpecificUser } = require('./api/UserInfo');

const { checkUserRole, checkPermissionWithUserID } = require('../checkPermission/index');

const { getSeatInfo,createSeats} = require('./api/SeatInfo');

const { getSpecificUserOrderHistory } = require('./api/OrderHistory');

const collectionUserRole = require('../config/mongoDB').getNewCollection("user_role");

const { getNewCollection } = require('../config/mongoDB');

indexRouter.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const result = await LoginApi.loginService(email, password);
    if (!result) {
        return res.json({
            status: 301,
            message: "login fail"
        });
    }
    const userInfo = await getUserInfo(email);
    console.log(userInfo);
    res.cookie('sessionID', await getSessionId(email), { httpOnly: true });
    res.cookie('username', userInfo.username, { httpOnly: true });
    res.cookie('email', email, { httpOnly: true });
    const collection = getNewCollection('user_role');
    const roleResult = await collection.find({ email: email }).toArray();
    if (roleResult.length === 0) {
        return res.json({
            status: 301,
            message: "User role not found"
        });
    }
    const role = roleResult[0].role;
    const status = role === 'admin' ? 201 : 200;
    const message = role === 'admin' ? "Hello admin!" : "Hello user!";
    return res.json({
        status: status,
        message: message
    });
});
// 退出登录
indexRouter.post('/users/login/out', async (req,res) => {
    const sessionID = req.cookies.sessionID;
    console.log(sessionID);
    if(!await clearSession(sessionID))
        res.json({status:401, message:"login out unsuccessfully"})
    res.clearCookie('sessionID', {httpOnly:true});
    res.clearCookie('username', {httpOnly:true});
    res.clearCookie('email', {httpOnly:true});
    res.json({status:200, message:"Login out successfully"});
})

indexRouter.post('/users/login/status', async (req,res) => {
    const email = req.cookies.email;
    console.log(`email : ${email}`);
    if(! await checkUserSessionStatus(email))
        return res.json({status:401, message: "User have not login in System"});
    return res.json({status:200, message: "User have login system"});
})

indexRouter.post('/api/checkLoginSession',async (req,res) => {
    const sessionID = req.cookies.sessionID;
    if(sessionID === null)
        return res.json({message:"sessionID is null",status:300});
    if(! await checkSessionStatus(sessionID))
        return res.json({message:"session out of date",status:301});
    res.json({message:"session pass",status:200});
})

const RegisterApi = require('./api/Register')

indexRouter.post('/api/register',async (req,res) => {
    // const {email,password,username,registerDate} = req.body
    // const result = await RegisterApi.RegisterService(email,password,username,registerDate)
    // res.json(result)
    const userData = req.body;
    const result = await RegisterApi.RegisterService(userData);
    res.json(result)
})

indexRouter.post('/test/checkUserRole', (req, res) => {
    const {user_id} = req.body
    checkUserRole(user_id)
})

indexRouter.post('/test/checkPermissionWithUserID', async (req, res) => {
    const {user_id} = req.body
    let funRes = null
    await checkPermissionWithUserID(user_id, "view").then(r => {
        funRes = r
    })
    console.log(funRes)
})

indexRouter.post('/api/userInfo', async (req,res) => {
    const email = req.cookies.email;
    const username = req.cookies.username;
    return res.json({email: email, username: username, status: 200});
})
// TODO:写一个新的请求用户信息函数
indexRouter.post('/api/getSeatInfo' , getSeatInfo)

indexRouter.post('/api/orderSeat' , createSeats)
// test
const { checkSessionExitWhitEmail } = require("../sessionStore/index")

indexRouter.post('/test/checkSession', async (req,res) => {
    const email =  req.body
    await checkSessionExitWhitEmail(email)
    res.json("111")
})

indexRouter.post('/api/changeUsername', async (req,res) => {
    const { username } = req.body;
    const email = req.cookies.email;
    const response = await changeUsername(username,email);
    if(response.status === 200){
        res.cookie('username',username);
    }
    res.json(response);
})

indexRouter.post('/api/users/delete', async (req,res) => {
    const email = req.cookies.email;
    const response = await deleteSpecificUser(email);
    res.json(response);
})

indexRouter.post('/api/users/orderHistory', async (req,res) =>{
    const email = req.cookies.email;

    const result = await getSpecificUserOrderHistory(email);

    res.json(result);
})
//获取用户的角色
indexRouter.post('/user/character', async (req,res) => {
    const email = req.cookies.email;

    const roles = await collectionUserRole.find({
        email:email
    }).toArray();
    console.log(roles[0]);
    if(roles.length <= 0) {
        return res.json({
            email:email,
            status: 301,
            message: "无角色",
            data:""
        })
    }
    return res.json({
        email:email,
        status:200,
        message:"找到角色属性",
        data:roles[0].role
    })
})
//返回所有通知
indexRouter.post('/api/getAllPublishNotice', async (req,res) => {
    const noticeCollection = getNewCollection('notice');
    return res.json({
        status:200,
        message:"获取所有通知成功",
        data:await noticeCollection.find({
            status:"已发布"
        }).toArray()
    })
})
//预约座位模块：获取当前日期的座位预定情况
indexRouter.post('/api/seat/getAllSeatInfo', async(req,res) => {
    const date = req.body.date;
    const date_yymmdd = date.toISOString().split('T')[0];
    console.log(date_yymmdd);
    return res.json({
        status:200
    })
})
//预约座位模块：预约一个座位
indexRouter.post('/api/seat/OrderOne',async (req,res) => {
    const {seat_id,date} = req.body;
    const checkDate = new Date(date);
    const email = req.cookies.email;
    const seatsCollection = getNewCollection('seats');
    //每个用户每天只能预约一个座位
    const result1 = await seatsCollection.find(
        {
            email:email,
            date:checkDate.toISOString().split('T')[0]
        }
        ).toArray();
    const result2 = await seatsCollection.find(
        {
            date:checkDate.toISOString().split('T')[0]
        }).toArray();
    console.log(result1)
    if(result1.length > 0) {
        return res.json({
            status:301,
            meg:"用户已经当天已经预约了"
        })
    }
    if(result2.length > 0){
        return res.json({
            status:302,
            meg:"该座位已被预约"
        })
    }
    seatsCollection.insertOne({
        seat_id:seat_id,
        email:email,
        date:checkDate.toISOString().split('T')[0]
    }).then(() => {
        console.log(`${email} 用户预约座位${seat_id}成功`);
    })
    return res.json({
        status:200,
        meg:"预约座位成功"
    })
})
//预约座位模块：返回所选日期的座位预约情况
indexRouter.post('/api/seat/Status',async (req,res) => {
    const {date} = req.body;
    const checkDate = new Date(date);
    const seatCollection = getNewCollection('seats');
    const result = await seatCollection.find({
        date:checkDate.toISOString().split('T')[0]
    }).toArray();
    return res.json(result);
})
//预约座位模块：换座
indexRouter.post('/api/seat/ChangeSeat',async (req,res) => {
    const { targetSeat,selectDate} = req.body;
    const email = req.cookies.email;
    const collection1 = getNewCollection('seats');
    const collection2 = getNewCollection('seat_operation');

    const result1 = await collection1.find({email:email,date:selectDate}).toArray();
    /*删除原有的记录*/
    collection1.deleteOne({email:email,date:selectDate});
    /*添加新的预约记录*/
    collection1.insertOne({seat_id:targetSeat,email:email,date:selectDate});
    /*添加新的座位操作记录*/
    collection2.insertOne({
        email:email,
        date:selectDate,
        originSeat:result1[0].seat_id,
        targetSeat:targetSeat,
        operation:"换座"
    });
    return res.json({
        status:200,
        meg:"换座成功"
    })
})
//返回明天和后天的日期
indexRouter.post('/api/TodayAndTomorrow',async (req,res) => {
    const { TodayAndTomorrow  } = require("../Tool/MyDate");
    return res.json({
        status:200,
        data:TodayAndTomorrow()
    })
})
// 返回用户的所有操作记录
indexRouter.post('/api/user/operations',async (req,res) => {
    const email = req.cookies.email;
    const collection = getNewCollection('seat_operation');
    const result = await collection.find({
        email:email
    }).toArray();
    return res.json({
        status:200,
        data:result
    })
})
// 修改用户名
indexRouter.post('/api/user/change/username',async (req,res) => {
    const email = req.cookies.email;
    const { username } = req.body;
    const collection_user = getNewCollection('users');
    collection_user.updateOne({
        email:email
    },{
        $set:{
            username:username
        }
    }).then(() => {
        console.log(`${email} 修改用户名成功`);
    })
    const result = await collection_user.find({
        email:email
    }).toArray();
    res.cookie('username', result[0].username, { httpOnly: true });
    return res.json({
        status:200,
        data:result[0]
    })
})
// New 新建一个用户
indexRouter.post('/test/add/user',async (req,res) => {
    const userData = req.body;
    const usersCollection = getNewCollection('newUsers');
    await usersCollection.insertOne({
        username: userData.username,
        password:userData.password
    })
    const user = await usersCollection.find({
        username: userData.username
    }).toArray();
    const testCollection = getNewCollection('test');
    await testCollection.insertOne({
        user_id : user[0]._id,
    })
})
indexRouter.post('/test2', async (req,res) => {
    const testCollection = getNewCollection('test');
    const result = await testCollection.find().toArray();
    const usersCollection = getNewCollection('newUsers');
    const result2 = await usersCollection.find({
        _id:result[0].user_id
    }).toArray();
    return res.json({
        status:200,
        data:result2[0]
    })
})
module.exports = indexRouter