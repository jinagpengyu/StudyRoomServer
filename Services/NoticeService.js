const {
    noticeCollection,
    usersCollection
} = require('../config/mongoDB')
const {
    ObjectId
} = require('mongodb');
const MyDateTool = require('../Tool/MyDate')
module.exports = {
    async AddNewNotice(req,res) {
        const {
            title,
            data,
            visible
        } = req.body;
        if(!title || !data || typeof visible === 'undefined'){
            return res.json({
                status:400,
                message:"参数错误"
            })
        }
        try {
            const result = await noticeCollection.insertOne({
                title: title,
                data: data,
                visible: visible,
                publishDate: MyDateTool.GetSelectDate().todayDate,
                type : "公告",
                status : "正常"
            });

            if (result.insertedId) {
                return res.status(200).json({ message: '公告插入成功', insertedId: result.insertedId });
            } else {
                throw new Error('Insert operation did not return an inserted ID');
            }
        } catch (error) {
            return res.status(500).json({ error: '公告插入失败: ' + error.message });
        }
    },
    /**
     * 返回所有有效的通知，但是过滤掉不能被用户身份看见的通知。
     *
     * 实例说明：
     *  - 指定给黑名单用户查看的通知，正常用户不能查看
     * @param req
     * @param res
     * @returns {Promise<*>}
     * @constructor
     */
    async GetAllNotice(req,res) {
        try {// 要按身份返回不同的公告
            const user = await usersCollection.findOne({
                _id: new ObjectId(req.user.user_id)
            });
            let result;
            if ( user.role === 'user' ) {
                if ( user.status === '正常' ) {
                    result = await noticeCollection.find(
                        {
                            status: {$ne: "删除"},
                            visible: {$ne: "黑名单"},
                        }
                    ).toArray();
                } else if ( user.status === '黑名单' ){
                    result = await noticeCollection.find(
                        {
                            status: {$ne: "删除"},
                            visible: {$ne: '正常用户'}
                        }
                    ).toArray();
                }
            } else if ( user.role === 'admin') {
                result = await noticeCollection.find(
                    {
                        status: {$ne: "删除"},
                    }
                ).toArray();
            }

            return res.status(200).json({
                data:result
            });
        } catch (error) {
            return res.status(500).json({ error: '获取公告失败: ' + error.message });
        }
    },
    async DeleteOneNotice(req,res){
        const { notice_id } = req.body;
        if(!notice_id) {
            return res.status(400).json({
                message:"参数错误"
            })
        }
        const result = await noticeCollection.updateOne(
            {
                _id: new ObjectId(notice_id)
            },
            {
                $set: {
                    status: "删除"
                }
            }
        );
        if (result.modifiedCount === 0){
            return res.status(400).json({
                message:"删除失败"
            })
        }
        return res.status(200).json({
            message:"删除成功"
        })

    }

}