const {GetUserId} = require("../Tool/UserTool");
const {orderCollection,usersCollection,seatCollection} = require("../config/mongoDB")
const UserTool = require("../Tool/UserTool")
const MyDateTool = require("../Tool/MyDate")
const {ObjectId} = require("mongodb")
const {deleteSpecificUser} = require("../router/api/UserInfo");
const assert = require("node:assert");

module.exports = {
    /**
     * 预约一个座位
     * @param req -
     * @param res
     * @returns {Promise<*>}
     * @constructor
     */
    async OrderOneSeat(req,res){
        const {seat_id,order_date} = req.body;
        const status = order_date  === MyDateTool.GetSelectDate().todayDate ? "使用中" : "未使用";
        if ( !seat_id || !order_date ) {
            return res.status(400).json({
                message: "参数错误"
            })
        }

        try {
            const user = req.user;
            let result;
            // 检查用户这一天是否已经预约过座位了
            result = await orderCollection.findOne(
                {
                    user_id: new ObjectId(user.user_id),
                    order_date: order_date,
                    status: status
                }
            );

            if ( result ) {
                return res.status(400).json({
                    message: '你已经在该日期下预约过一个座位了'
                })
            }

            // 检查座位的可预约
            result = await seatCollection.findOne({
                seat_id: seat_id
            })
            if (result.seat_status === '暂停预约') {
                return res.status(400).json({
                    message: "该座位不可预约"
                })
            }
            // 检查该座位有无人预约
            result = await orderCollection.findOne({
                seat_id: seat_id,
                order_date: order_date,
                status: {$in: ['使用中', '未使用']}
            })
            if ( result ) {
                return res.status(400).json({
                    message: "该座位有人预约"
                })
            }
            // 插入预约记录
            result = await orderCollection.insertOne({
                user_id: new ObjectId(user.user_id),
                seat_id: seat_id,
                order_date: order_date,
                create_time: MyDateTool.GetSelectDate().todayDate,
                status: status
            });

            if ( !result.acknowledged ) {
                return res.status(500).json({ message: "预约失败，请稍后再试" });
            }

            return res.status(200).json({
                message: "预约成功",
            })
        } catch (e) {
            return res.status(400).json({
                message: "Invalid or expired token"
            })
        }
    },
    /**
     * 获取特定用户的所有预约记录
     * @param {Object} req - Express请求对象，需包含body参数：
     * @param res - Express响应对象
     * @returns {Promise<*>}
     * @constructor
     */
    async GetAllOrderHistory(req,res){
        const user = req.user;
        const result = await orderCollection.find({
            user_id:new ObjectId(user.user_id),
            status: {$ne: "已删除"}
        }).toArray();

        if (result.length <= 0) {
            return res.status(400).json({
                message:"没有数据"
            })
        }

        return res.status(200).json({
            data:result,
            message:"获取成功"
        })
    },
    /**
     * 用户取消预约一个座位
     * @param req
     *  @param {string} req.body.order_id - 要取消的预约记录的ID
     * @param res
     * @returns {Promise<*>}
     * @constructor
     */
    async CancelOrder (req,res) {
        const user = req.user;
        const { order_id } = req.body;
        try {
            const result = await orderCollection.updateOne(
                {
                    _id: new ObjectId(order_id),
                    user_id: new ObjectId(user.user_id),
                    status: {$in: ['使用中','未使用']}
                },
                { $set: { status: "取消" } }
            );

            if (result.matchedCount === 0) {
                return res.status(400).json({
                    message:"预约记录不存在"
                })
            }

            return res.status(200).json({
                message:"取消成功"
            })
        } catch (e) {
            return res.status(400).json({
                message:"取消预约失败"
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
                status: { $in: ["使用中","未使用"]}
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
    },
    GetSelectDate(req,res){
        return res.json({
            status:200,
            data:MyDateTool.GetSelectDate()
        })
    },
    async GetAllUserOrderHistory(req,res){
        const result = await orderCollection.aggregate([
            {
              $match: {
                status: { $ne: "已删除"}
              }
            },
            {
                $lookup:{
                    from:"users",
                    localField:"user_id",
                    foreignField:"_id",
                    as:"user_info"
                }
            },
            {
                $project:{
                    _id:1,
                    user_name:{ $arrayElemAt: ["$user_info.name", 0] },
                    seat_id:1,
                    order_date:1,
                    create_time:1,
                    status:1
                }
            }
        ]).toArray();
        console.log(result)
        return res.json({
            status:200,
            data:result
        })
    },
    async DeleteOneOrder(req,res){
        const {order_id} = req.body;
        await orderCollection.updateOne(
            { _id: new ObjectId(order_id) },
            { $set: { status: "已删除" } }
        );
        return res.json({
            status:200,
            message:"删除成功"
        })
    },
    /**
     * 用户修改预约的座位
     * @param req
     * @param res
     * @returns {Promise<*>}
     * @constructor
     */
    async UserChangeSeat(req,res){
        const user = req.user;
        const {order_id,target_seat_id} = req.body;
        const result = await orderCollection.updateOne(
            {
                _id: new ObjectId(order_id),
                user_id: new ObjectId(user.user_id),
                status: {
                    $in: ['使用中','未使用']
                }
            },
            { $set: { seat_id: target_seat_id } }
        )

        if (result.matchedCount === 0) {
            return res.status(400).json({
                message:"预约记录不存在"
            })
        }

        return res.status(200).json({
            message:"修改成功"
        })
    },
    /**
     * 管理员修改预约的座位
     * @param req
     * @param res
     * @returns {Promise<void>}
     * @constructor
     */
    async AdminChangeSeat(req,res){
        const { order_id, target_seat_id } = req.body;
        const result = await orderCollection.updateOne({
            _id: new ObjectId(order_id),
            status: "正常"
        }, {
            $set: { seat_id: target_seat_id }
        });

        if (result.matchedCount === 0) {
            return res.status(400).json({
                message:"预约记录不存在"
            })
        }

        return res.status(200).json({
            message:"修改成功"
        })
    },
    /**
     * 修改单个座位状态
     * @param req
     * @param res
     * @returns {Promise<*>}
     * @constructor
     */
    async ChangeSeatStatus(req,res){
        const {seat_id,target_status} = req.body;
        await seatCollection.updateOne(
            {seat_id:seat_id},
            { $set: { seat_status: target_status } }
        )
        return res.json({
            status:200,
            message:"修改成功"
        })
    },
    /**
     * 批量修改座位状态
     * @param req
     * @param res
     * @returns {Promise<*>}
     * @constructor
     */
    async ChangeSeatStatusBatch(req,res){
        const { seat_arr , target_status} = req.body;
        await seatCollection.updateMany(
            { seat_id: { $in: seat_arr } },
            { $set: { seat_status: target_status } }
        )
        return res.json({
            status:200,
            message:"修改成功"
        })
    },
    async GetAllActiveSeat(req,res){
        const { order_date } = req.body;

        try {
            const result = await seatCollection.aggregate([
                // 第一步：筛选出所有可预约的座位
                {
                    $match: {
                        seat_status: "可预约"
                    }
                },
                // 第二步：关联订单集合，查找当天已预约的记录
                {
                    $lookup: {
                        from: "orders",
                        let: { seatId: "$seat_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$seat_id", "$$seatId"] },
                                            { $eq: ["$order_date", order_date] },
                                            { $eq: ["$status", "正常"] }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "orders"
                    }
                },
                // 第三步：只保留那些当天没有被预约的座位
                {
                    $match: {
                        orders: { $size: 0 }
                    }
                },
                // 第四步：清理不需要的字段
                {
                    $project: {
                        orders: 0
                    }
                }
            ]).toArray();


            if (result.length <= 0) {
                return res.status(400).json({
                    message: "获取失败," + e.message
                })
            }

            return res.status(200).json({
                data: result,
                message: "获取成功"
            })

        } catch (e) {
            return res.status(409).json({
                message: "获取失败," + e.message
            })
        }
    },
    /**
     * 获取某天的所有座位预约情况，包括使用中，暂停预约等状态
     * @param req
     * @param res
     * @returns {Promise<void>}
     * @constructor
     */
    async GetAllSeatOrdersByDate(req,res){
        const { date } = req.body;
        try {
            const target_status = date === MyDateTool.GetSelectDate().todayDate ? '使用中': '未使用';
            const result = await seatCollection.aggregate([
                {
                    $lookup: {
                        from: 'orders',
                        localField: 'seat_id',
                        foreignField: 'seat_id',
                        as: 'orders',
                        pipeline: [
                            {
                                $match: {
                                    order_date: date,
                                    status: target_status
                                }
                            }
                        ]
                    }
                },
                {
                    $project: {
                        _id: 0,
                        seat_id: 1,
                        order_status: {
                            $cond: {
                                if: { $eq: [ '$seat_status' , '暂停预约']},
                                then: '暂停预约',
                                else: {
                                    $cond: {
                                        if: { $eq: [ { $size: "$orders" }, 0 ] },
                                        then: "可预约",
                                        else: "使用中"
                                    }
                                }
                            }
                        },
                    }
                }
            ]).toArray();

            if ( result.length <= 0 ) {
                return res.status(400).json({
                    message: "获取失败," + e.message
                })
            }

            return res.status(200).json({
                data: result,
                message: "获取成功"
            })
        } catch (e) {
            return res.status(400).json({
                message: "获取失败," + e.message
            })
        }
    }
}
