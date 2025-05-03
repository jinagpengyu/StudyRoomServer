const express = require('express');
const adminRouter = express.Router();
const { getNewCollection } = require('../config/mongoDB')
const {TodayAndTomorrow, NowYYMMDDString} = require("../Tool/MyDate");
const {ObjectId} = require("mongodb");
const ConventionService = require('../Services/ConventionService');
const ReportService = require('../Services/ReportService');
const SeatService = require('../Services/SeatService');
const UserInfoService = require('../Services/UserInfoService');
const NoticeService = require('../Services/NoticeService');
//获取所有公告
adminRouter.post('/admin/get_all_notice',NoticeService.GetAllNotice)
// 所有的用户信息 //TODO:需要鉴权
adminRouter.post('/admin/get_user_info',UserInfoService.GetAllUserInfo)
// 返回所有的座位信息
adminRouter.post('/admin/getAllSeats',SeatService.GetAllSeatInfo)
// 为用户的投诉报告创建一个回复
adminRouter.post('/admin/create_reply',ReportService.CreateReplyForReport)
// 获取所有的投诉举报 //TODO:需要鉴权
adminRouter.post('/admin/getAllReport',ReportService.GetAllReport_Admin)
// 获取预约的详细信息
adminRouter.post('/admin/getOrderUserInfo',SeatService.GetOrderDetail)
// 获取所有的预约信息
adminRouter.post('/admin/getAllOrderHistory',SeatService.GetAllUserOrderHistory)
// 删除一条预约信息
adminRouter.post('/admin/deleteOneOrder',SeatService.DeleteOneOrder)
// 为用户换座
adminRouter.post('/admin/changeSeat',SeatService.AdminChangeSeat)
// 修改座位的状态，暂停预约或可预约
adminRouter.post('/admin/changeSeatStatus',SeatService.ChangeSeatStatus)
// 批量修改座位的状态
adminRouter.post('/admin/changeSeatStatusBatch',SeatService.ChangeSeatStatusBatch)
// 修改用户的状态，是否在黑名单中
adminRouter.post('/admin/changeUserStatus',UserInfoService.UpdateUserStatus)
// 删除用户 // TODO:需要鉴权
adminRouter.post('/admin/deleteOneUser',UserInfoService.DeleteUser)
// 添加新公告 // TODO:需要鉴权
adminRouter.post('/admin/addNewNotice',NoticeService.AddNewNotice)
// 删除一条公告
adminRouter.post('/admin/deleteOneNotice',NoticeService.DeleteOneNotice)
// 获取所有的公约
adminRouter.post('/admin/all_convention',ConventionService.GetAllConventions)
// 修改公约
adminRouter.post('/admin/changeConventionContext',ConventionService.UpdateOneConvention)
// 删除公约
adminRouter.post('/admin/deleteOneConvention',ConventionService.DeleteOneConvention)
// 新建公约
adminRouter.post('/admin/createNewConvention',ConventionService.CreateNewConvention)
module.exports = adminRouter;