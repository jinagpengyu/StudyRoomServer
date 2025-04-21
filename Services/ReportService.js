const {reportCollection} = require('../config/mongoDB')
const { ObjectId } = require('mongodb');
const {NowYYMMDDString} = require("../Tool/MyDate");
const {GetUserId} = require("../Tool/UserTool");
const assert = require("node:assert");
module.exports = {
    async CreateNewReport(req,res){
        const insertJson = {
            user_id : new ObjectId(req.body.user_id),
            report_content : req.body.content,
            report_time : new Date().getTime()
        }
        await reportCollection.insertOne(insertJson);
        return res.json({
            status:200,
            message:"报告成功"
        })
    },
    async CreateReplyForReport(req, res) {
        const {reply_content,report_id} = req.body;
        await reportCollection.updateOne({
            _id:new ObjectId(report_id)
        },{
            $set:{
                reply:{
                    reply_content:reply_content,
                    replyDate:NowYYMMDDString()
                }
            }
        });
        return res.json({
            status:200,
            message:"回复成功"
        })
    },
    async GetAllReport_Admin(req, res){
        const result = await reportCollection.find().toArray();
        return res.json({
            status:200,
            data:result
        })
    },
    async GetAllReport_User(req,res){
        const email = req.cookies.email;
        const user_id = await GetUserId(email);
        const result = await reportCollection.find({
            user_id:new ObjectId(user_id)
        }).toArray();
        return res.json({
            status:200,
            data:result
        })
    }
}