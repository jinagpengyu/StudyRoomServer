const {GetUserId} = require("../Tool/UserTool");
const {OrderSeatService} = require("../router/api/SeatService");
const {orderCollection} = require("../config/mongoDB")
const MyDate = require('../Tool/MyDate')
const UserTool = require("../Tool/UserTool")
module.exports = {
    async OrderOneSeat(req,res){
        const {seat_id,order_date} = req.body;
        const email = req.cookies.email;
        const user_id = await GetUserId(email);
        let result
        result = await orderCollection.find({
            seat_id:seat_id,
            order_data:order_date,
            status:"正常"
        }).toArray()
        if(result.length > 0){
            return res.json({
                status:400,
                message:"该座位已被预订"
            })
        }

        result = await orderCollection.find({
            user_id:new Object(user_id),
            order_date: order_date,
            status:"正常"
        }).toArray()
        if(result.length > 0){
            return res.json({
                status:400,
                message:"您已经在当天预约过座位了，一人一天最多预约一个座位"
            })
        }
        // TODO:检查用户是否处于黑名单中
        await orderCollection.insertOne({
            user_id:new Object(user_id),
            seat_id:seat_id,
            order_date:order_date,
            create_time:new Date().getTime(),
            status:"正常"
        })
        res.json({
            status:200,
            message:"预约成功"
        })
    },
    async GetAllOrderHistory(req,res){
        const email = req.cookies.email
        const user_id = await GetUserId(email)
        let result_json = []
        let result
        try {
            result = await orderCollection.find({
                user_id:new Object(user_id)
            }).toArray()
            if(result.length > 0){
                for (const item of result) {
                    let tmp
                    if(item.status === "正常"){
                        tmp = {
                            id:item._id,
                            seat_id:item.seat_id,
                            order_date:item.order_date,
                            create_time:await UserTool.GetFormatedDate(item.create_time),
                            status:item.status,
                            operation :[
                                '详细'
                            ]
                        }
                    }else{
                        tmp = {
                            id:item._id,
                            seat_id:item.seat_id,
                            order_date:item.order_date,
                            create_time:await UserTool.GetFormatedDate(item.create_time),
                            status:item.status,
                            operation :[
                                '详细'
                            ]
                        }
                    }
                    result_json.push(tmp)
                }
            }
            return res.json({
                status:200,
                data:result_json
            })
        }catch (e){
            return res.json({
                status:400,
                message:"获取失败"
            })
        }
    }
}
