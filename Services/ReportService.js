const {reportCollection} = require('../config/mongoDB');
const { ObjectId } = require('mongodb');
const {NowYYMMDDString} = require("../Tool/MyDate");
const MyDateTool = require("../Tool/MyDate");
module.exports = {
    async CreateNewReport(req,res){
        try {
            const {title,type,content} = req.body
            const user = req.user;
            const insertJson = {
                user_id:new ObjectId(user.user_id),
                title:title,
                type:type,
                content:content,
                status:"待处理",
                report_date:MyDateTool.GetSelectDate().todayDate,
            }
            const result = await reportCollection.insertOne(insertJson);
            if ( !result.acknowledged ) {
                return res.status(400).json({
                    message:"报告失败"
                })
            }

            return res.json({
                status:200,
                message:"报告成功"
            })
        } catch (e) {
            console.error(e)
        }
    },
    async CreateReplyForReport(req, res) {
        const {reply_content,report_id} = req.body;
        const result = await reportCollection.updateOne({
            _id:new ObjectId(report_id)
        },{
            $set:{
                reply:{
                    reply_content:reply_content,
                    replyDate:NowYYMMDDString()
                },
                status:'已处理'
            }
        });

        if (result.matchedCount === 0) {
            return res.status(400).json({
                message:"回复失败"
            })
        }

        return res.status(200).json({
            message:"回复成功"
        })
    },
    async GetAllReport_Admin(req, res){
        const result = await reportCollection.aggregate([
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
                    user_name:{ $arrayElemAt: ["$user_info.name", 0] },
                    title:1,
                    type:1,
                    content:1,
                    status:1,
                    report_date:1,
                    reply:1
                }
            }
        ]).toArray();

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
    async GetAllReport_User(req,res){
        const user = req.user;
        const result = await reportCollection.find({
            user_id:new ObjectId(user.user_id)
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
    }
}