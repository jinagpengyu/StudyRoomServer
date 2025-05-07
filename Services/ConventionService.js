const { conventionCollection } = require('../config/mongoDB')
const {convention} = require("../Models/Convention");
const { NowYYMMDDString } = require('../Tool/MyDate');
const { ObjectId } = require('mongodb');
const MyDateTool = require('../Tool/MyDate');
module.exports = {
    async CreateNewConvention (req,res) {
        const {context} = req.body;
        const result = await conventionCollection.insertOne({
            context:context,
            createDate:MyDateTool.GetSelectDate().todayDate,
            status:"已发布"
        });
        if (!result.insertedId){
            return res.status(400).json({
                message:"创建失败"
            })
        }
        return res.status(200).json({
            message:"创建成功",
            insertedId:result.insertedId
        })
    },
    async UpdateOneConvention(req,res) {
        const {context,convention_id} = req.body;
        const result = await conventionCollection.updateOne({
            _id:new ObjectId(convention_id)
        },{
            $set:{
                context:context,
                createDate:MyDateTool.GetSelectDate().todayDate
            }
        });
        if (result.matchedCount === 0) {
            return res.status(400).json({
                message:"修改失败"
            })
        }
        return res.status(200).json({
            message:"修改成功"
        })
    },
    async GetAllConventions(req,res){
        const result = await conventionCollection.find({
            status:{$ne:"删除"}
        }).toArray();
        return res.status(200).json({
            status:200,
            data:result
        })
    },
    async DeleteOneConvention(req,res){
        const {convention_id} = req.body;
        const result = await conventionCollection.updateOne(
            {
            _id:new ObjectId(convention_id)
            },
            {
                $set:{
                    status:"删除"
                }
            }
        )
        if (result.matchedCount === 0) {
            return res.status(400).json({
                message:"删除失败"
            })
        }
        return res.status(200).json({
            message:"删除成功"
        })
    }

}