const express = require('express');
const indexRouter = express.Router();
const ReportService = require('../Services/ReportService')
const ConventionService= require('../Services/ConventionService')
const SeatService = require('../Services/SeatService')
const UserInfoService = require('../Services/UserInfoService')
const LoginService = require('../Services/LoginService')
const NoticeService = require('../Services/NoticeService')
const JWTService = require('../middleware/authenticateJWT')
const { getNewCollection } = require('../config/mongoDB');
const { UpdateSeatStatus } = require('./interceptor/SeatInterceptor')
// 登录
indexRouter.post('/api/login', LoginService.LoginService);
// 退出登录
indexRouter.post('/users/login/out', LoginService.Logout)
// 注册
indexRouter.post('/api/register',LoginService.RegisterUser)
// 获取用户的信息
indexRouter.post('/api/userInfo',UserInfoService.GetOneUserInfo )
// 返回所有通知
indexRouter.post('/api/getAllPublishNotice', NoticeService.GetAllNotice)
// 预约座位模块：预约一个座位
indexRouter.post('/api/seat/OrderOne',SeatService.OrderOneSeat)
// 预约座位模块：返回所选日期的座位预约情况
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
// 预约座位模块：换座
indexRouter.post('/user/changeSeat',JWTService.authenticateJWT,SeatService.UserChangeSeat);
/**
 * @description 修改用户名
 * @route POST /api/user/change/username
 * @permission user
 */
indexRouter.post('/api/user/change/username',UserInfoService.UpdateUsername)
// 修改邮箱
indexRouter.post('/api/user/change/email',UserInfoService.UpdateEmail)
// 返回用户所有的预约记录
indexRouter.post('/user/getAllOrders',[UpdateSeatStatus,JWTService.authenticateJWT], SeatService.GetAllOrderHistory)
// 取消预约
indexRouter.post('/user/cancelOrder',JWTService.authenticateJWT,SeatService.CancelOrder)
// 添加一个投诉
indexRouter.post('/user/addNewReport',ReportService.CreateNewReport)
// 获取所有的公约
indexRouter.post('/user/getAllConvention',ConventionService.GetAllConventions)
// 获取所有的个人投诉
indexRouter.post('/user/getAllReport', JWTService.authenticateJWT ,ReportService.GetAllReport_User)
// 获取今明的日期
indexRouter.post('/tool/getSelectDate',SeatService.GetSelectDate)
// 返回某个日期下的所有可预约的座位
indexRouter.post('/user/getActiveSeat',JWTService.authenticateJWT,SeatService.GetAllActiveSeat)
module.exports = indexRouter