const express = require('express');
const indexRouter = express.Router();
const ReportService = require('../Services/ReportService')
const ConventionService= require('../Services/ConventionService')
const SeatService = require('../Services/SeatService')
const UserInfoService = require('../Services/UserInfoService')
const LoginService = require('../Services/LoginService')
const NoticeService = require('../Services/NoticeService')
const JWTService = require('../middleware/authenticateJWT')
const { UpdateSeatStatus } = require('./interceptor/SeatInterceptor')

// 注册
indexRouter.post('/api/register',LoginService.RegisterUser)
// 登录
indexRouter.post('/api/login',JWTService.updateSeatStatus ,LoginService.LoginService);
// 获取所有的公约
indexRouter.post('/user/getAllConvention',ConventionService.GetAllConventions)
// 中间件
indexRouter.use(JWTService.authenticateJWT)
// 退出登录
indexRouter.post('/users/login/out', LoginService.Logout)
// 获取用户的信息
indexRouter.post('/api/userInfo',UserInfoService.GetOneUserInfo )
// 返回所有通知
indexRouter.post('/api/getAllPublishNotice', NoticeService.GetAllNotice)
// 预约座位模块：预约一个座位
indexRouter.post('/api/seat/OrderOne',SeatService.OrderOneSeat)
// 预约座位模块：返回所选日期的座位预约情况
indexRouter.post('/api/seat/Status',SeatService.GetAllSeatOrdersByDate)
// 预约座位模块：换座
indexRouter.post('/user/changeSeat',SeatService.UserChangeSeat);
// 修改用户名
indexRouter.post('/api/user/change/username',UserInfoService.UpdateUsername)
// 修改邮箱
indexRouter.post('/api/user/change/email',UserInfoService.UpdateEmail)
// 返回用户所有的预约记录
indexRouter.post('/user/getAllOrders',[UpdateSeatStatus], SeatService.GetAllOrderHistory)
// 取消预约
indexRouter.post('/user/cancelOrder',SeatService.CancelOrder)
// 添加一个投诉
indexRouter.post('/user/addNewReport',ReportService.CreateNewReport)
// 获取所有的个人投诉
indexRouter.post('/user/getAllReport' ,ReportService.GetAllReport_User)
// 获取今明的日期
indexRouter.post('/tool/getSelectDate',SeatService.GetSelectDate)
// 返回某个日期下的所有可预约的座位
indexRouter.post('/user/getActiveSeat',SeatService.GetAllActiveSeat)
// 注销用户
indexRouter.post('/user/deleteSelf',UserInfoService.UserDeleteSelf)
module.exports = indexRouter