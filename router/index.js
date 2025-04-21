const express = require('express');
const { ObjectId } = require('mongodb')
const indexRouter = express.Router();
const LoginApi = require('./api/Login');
const { OrderSeatService } = require('./api/SeatService');
const ReportService = require('../Services/ReportService')
const ConventionService= require('../Services/ConventionService')
const SeatService = require('../Services/SeatService')
const { GetUserId } = require('../Tool/UserTool')
const { checkSessionStatus , clearSession, checkSessionNotExit , checkUserSessionStatus} = require("../sessionStore/checkBySessionID");
const { getSessionId } = require('../sessionStore/index');
const { getUserInfo, changeUsername, deleteSpecificUser } = require('./api/UserInfo');
const { checkUserRole, checkPermissionWithUserID } = require('../checkPermission/index');
const { getSeatInfo,createSeats} = require('./api/SeatInfo');
const { getSpecificUserOrderHistory } = require('./api/OrderHistory');
const collectionUserRole = require('../config/mongoDB').getNewCollection("user_role");
const { getNewCollection } = require('../config/mongoDB');
const { UpdateSeatStatus, PrintSeatStatus } = require('./interceptor/SeatInterceptor')
c=
// 登录
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
// 获取用户的信息
indexRouter.post('/api/userInfo', async (req,res) => {
    const email = req.cookies.email;
    const usersCollection = await getNewCollection('users');
    const result = await usersCollection.findOne({email : email});
    return res.json({
        status:200,
        data:result
    })
})
indexRouter.post('/api/getSeatInfo' , getSeatInfo)
indexRouter.post('/api/orderSeat' , createSeats)
const { checkSessionExitWhitEmail } = require("../sessionStore/index")
const {getUserID} = require("../sessionStore");
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
//预约座位模块：预约一个座位
indexRouter.post('/api/seat/OrderOne',SeatService.OrderOneSeat)
//预约座位模块：返回所选日期的座位预约情况
indexRouter.post('/api/seat/Status',async (req,res) => {
    const seat_count = []
    const {date} = req.body;
    console.log(date)
    const seatCollection = getNewCollection('seats');
    const ordersCollection = getNewCollection('orders')
    const seats = await seatCollection.find().toArray()
    for(let i = 0;i < seats.length;i++) {
        const searchJson = {
            seat_id : seats[i].seat_id,
            order_date : date,
        }
        if(seats[i].seat_status === "暂停预约"){
            const pushJson = {
                seat_id:seats[i].seat_id,
                status:"暂停预约"
            }
            seat_count.push(pushJson)
        }else if(seats[i].seat_status === "可预约"){
            const result = await ordersCollection.find(searchJson).toArray()
            if(result.length === 0){
                const pushJson = {
                    seat_id:seats[i].seat_id,
                    status:"可预约"
                }
                seat_count.push(pushJson)
            }else{
                let pushJson = {
                    seat_id:seats[i].seat_id,
                    status:"可预约"
                }
                for (const resultElement of result) {
                    if(resultElement.status === "正常"){
                        pushJson.status = "已预约"
                    }
                }
                seat_count.push(pushJson)

            }
        }

    }
    res.json({
        status:200,
        data:seat_count
    })
})
//预约座位模块：换座
indexRouter.post('/api/seat/ChangeSeat',async (req,res) => {
    const {order_id,target_seat_id} = req.body;
    const ordersCollection = getNewCollection('orders');
    await ordersCollection.updateOne({
        order_id:order_id
    },{
        $set:{
            seat_id:target_seat_id
        }
    })
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
// 返回用户所有的预约记录
indexRouter.post('/user/getAllOrders',[UpdateSeatStatus,PrintSeatStatus], SeatService.GetAllOrderHistory)
// 取消预约
indexRouter.post('/user/cancelOrder',SeatService.CancelOrder)
// 获取某个预约座位的用户信息和座位信息
indexRouter.post('/api/getOrderInfo', async (req, res) => {
    const { seat_id, order_date } = req.body;
    const ordersCollection = getNewCollection('orders');
    const usersCollection = getNewCollection('users');

    const order = await ordersCollection.findOne({
        seat_id,
        order_date,
        status: "正常"
    });

    if (!order) {
        return res.json({
            status: 300,
            message: "该座位没有预约记录"
        });
    }

    const user = await usersCollection.findOne({
        _id: new ObjectId(order.user_id)
    });

    return res.json({
        status: 200,
        data: {
            user_info: user,
            order_info: order
        }
    });
});
// 添加一个投诉
indexRouter.post('/user/addNewReport',ReportService.CreateNewReport)
// 获取所有的公约
indexRouter.post('/user/getAllConvention',ConventionService.GetAllConventions)
// 获取所有的个人投诉
indexRouter.post('/user/getAllReport',ReportService.GetAllReport_User)
module.exports = indexRouter