const { GetUserId } = require("../Tool/UserTool");
const { usersCollection } = require("../Database/db"); // 假设 usersCollection 从数据库模块导入
const { ObjectID } = require("mongodb"); // 假设使用 MongoDB 的 ObjectID

module.exports = {
    async GetUserInfo(req, res) {
        const user_id = await GetUserId(req.body.email);
        try {
            let result;
            result = await usersCollection.findOne({
                _id: new ObjectID(user_id) // 使用 MongoDB 的 ObjectID
            });
            if (result) {
                return res.json({
                    status: 200,
                    data: result
                });
            } else {
                throw new Error('User not found'); // 具体化错误信息
            }
        } catch (e) {
            console.error(e); // 打印错误日志，便于排查
            return res.status(500).json({
                status: 500,
                message: e.message || "Internal Server Error" // 返回错误信息
            });
        }
    }
};
