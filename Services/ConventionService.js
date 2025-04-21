const { conventionCollection } = require('../config/mongoDB')
const {convention} = require("../Models/Convention");
const { NowYYMMDDString } = require('../Tool/MyDate');
const { ObjectId } = require('mongodb');
module.exports = {
    async CreateNewConvention (req,res) {
        const {context} = req.body;
        await conventionCollection.insertOne({
            context:context,
            createDate:NowYYMMDDString(),
            status:"已发布"
        });
        return res.json({
            status:200,
            message:"创建成功"
        })
    },
    async UpdateOneConvention(req,res) {
        const {context,convention_id} = req.body;
        await conventionCollection.updateOne({
            _id:new ObjectId(convention_id)
        },{
            $set:{
                context:context,
                publishDate:NowYYMMDDString()
            }
        });
        return res.json({
            status:200,
            message:"修改成功"
        })
    },
    async GetAllConventions(req,res){
        const result = await conventionCollection.find().toArray();
        return res.json({
            status:200,
            data:result
        })
    },

}