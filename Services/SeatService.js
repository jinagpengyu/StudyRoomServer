const {GetUserId} = require("../Tool/UserTool");
const {orderCollection,usersCollection,seatCollection} = require("../config/mongoDB")
const UserTool = require("../Tool/UserTool")
const {ObjectId} = require("mongodb")

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
                                '取消预约'
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
    },
    async CancelOrder (req,res) {
        const order_id = req.body.order_id
        console.log(order_id)
        try {
            let result
            result = await orderCollection.find({
                _id : new ObjectId(order_id),
                status: "正常"
            }).toArray()
            if(result.length > 0) {
                await orderCollection.updateOne({
                    _id:new ObjectId(order_id)
                },{$set:{
                        status:"取消"
                    }})
                return res.json({
                    status:200,
                    message:"取消成功"
                })
            }else{
                throw new Error("该订单不存在或已被取消")
            }
        }catch (e){
            console.error(e)
            return res.json({
                status:400,
                message:"取消失败"
            })
        }
    },
    /**
     * 获取预约指定座位用户的详细信息
     * @param {Object} req - Express请求对象，需包含body参数：
     *  @param {string} req.body.seat_id - 要查询的座位ID
     *  @param {string} req.body.order_date - 要查询的预约日期（格式应为YYYY-MM-DD）
     * @param {Object} res - Express响应对象
     * @returns {Promise<void>} 返回JSON响应：
     *  - 成功时（200）返回用户数据 { name: string, email: string }
     *  - 失败时（400）返回错误消息，包含失败原因：
     *    - 座位无预约记录
     *    - 用户不存在
     * @throws 当数据库查询失败时抛出异常
     */

    async GetOrderDetail(req,res){
        const {seat_id,order_date} = req.body;
        try {
            const order = await orderCollection.findOne({
                seat_id:seat_id,
                order_date:order_date,
                status:"正常"
            })
            if(!order){
                throw new Error("该座位没有预约记录")
            }
            const user = await usersCollection.findOne({
                _id:new ObjectId(order.user_id)
            })
            if(!user){
                throw new Error("该用户不存在")
            }
            return res.json({
                status:200,
                data:{
                    name:user.name,
                    email:user.email,
                }
            })

        }catch (e) {
            console.error(e)
            return res.json({
                status:400,
                message:"获取失败," + e.message
            })
        }
    },

    async GetAllSeatInfo(req,res){
        try{
            const result = await seatCollection.find({}).toArray()
            if(result.length > 0){
                return res.json({
                    status:200,
                    data:result
                })
            }else{
                throw new Error("座位信息获取失败")
            }
        }catch (e) {
            return res.json({
                status:400,
                message:"获取失败," + e.message
            })
        }
    }

}
