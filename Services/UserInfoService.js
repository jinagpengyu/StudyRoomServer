const { GetUserId } = require("../Tool/UserTool");
const { usersCollection } = require('../config/mongoDB'); // 假设 usersCollection 从数据库模块导入
const { ObjectId } = require("mongodb"); // 假设使用 MongoDB 的 ObjectID

module.exports = {
    async GetOneUserInfo(req, res) {
        const user_id = await GetUserId(req.cookies.email);
        try {
            let result;
            result = await usersCollection.findOne({
                _id: new ObjectId(user_id) // 使用 MongoDB 的 ObjectID
            });
            if (result) {
                return res.json({
                    status: 200,
                    data: result
                });
            } else {
                new Error('User not found'); // 具体化错误信息
            }
        } catch (e) {
            console.error(e); // 打印错误日志，便于排查
            return res.status(500).json({
                status: 500,
                message: e.message || "Internal Server Error" // 返回错误信息
            });
        }
    },
    async UpdateUsername(req, res) {
        const {  name } = req.body; // 解构请求体参数
        const email = req.cookies.email
        try {
            // 检查输入是否为空
            if (!email || !name) {
                return res.status(400).json({
                    status: 400,
                    message: "Missing required fields: email or name"
                });
            }

            // 获取用户 ID
            const user_id = await GetUserId(email);
            if (!user_id) {
                return res.status(404).json({
                    status: 404,
                    message: "User not found"
                });
            }

            // 更新用户名
            const result = await usersCollection.updateOne(
                { _id: new ObjectId(user_id) },
                { $set: { name: name } }
            );

            // 判断更新结果
            if (result.matchedCount === 0) {
                return res.status(404).json({
                    status: 404,
                    message: "User not found"
                });
            }

            if (result.modifiedCount > 0) {
                return res.json({
                    status: 200,
                    message: "Username updated successfully"
                });
            } else {
                return res.status(200).json({
                    status: 200,
                    message: "No changes made to username"
                });
            }
        } catch (e) {
            console.error(e); // 打印错误日志
            return res.status(500).json({
                status: 500,
                message: e.message || "Internal Server Error"
            });
        }
    },
    async UpdateEmail(req, res) {
        const currentEmail = req.cookies.email; // 当前用户的邮箱（从 cookie 中获取）
        const newEmail = req.body.email; // 新邮箱（从请求体中获取）

        try {
            // 1. 输入校验
            if (!newEmail) {
                return res.status(400).json({
                    status: 400,
                    message: "Missing required field: email"
                });
            }

            // 2. 获取当前用户 ID
            const user_id = await GetUserId(currentEmail);
            if (!user_id) {
                return res.status(404).json({
                    status: 404,
                    message: "User not found"
                });
            }

            // 3. 更新邮箱
            const result = await usersCollection.updateOne(
                { _id: new ObjectId(user_id) },
                { $set: { email: newEmail } }
            );
            if (result.modifiedCount > 0) {
                // 1. 更新 cookie 中的邮箱
                res.cookie('email', newEmail, {
                    httpOnly: true, // 仅服务器可访问
                    secure: process.env.NODE_ENV === 'production', // 生产环境启用 HTTPS
                    path: '/' // 作用域为整个应用
                });

                // 2. 返回成功响应
                return res.json({
                    status: 200,
                    message: "Email updated successfully"
                });
            } else {
                // 未修改时也更新 cookie（例如新旧邮箱相同的情况）
                res.cookie('email', newEmail, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    path: '/'
                });
                return res.status(200).json({
                    status: 200,
                    message: "No changes made to email"
                });
            }
            // 4. 判断更新结果
            if (result.matchedCount === 0) {
                return res.status(404).json({
                    status: 404,
                    message: "User not found"
                });
            }

            if (result.modifiedCount > 0) {
                return res.json({
                    status: 200,
                    message: "Email updated successfully"
                });
            } else {
                return res.status(200).json({
                    status: 200,
                    message: "No changes made to email"
                });
            }
        } catch (e) {
            console.error(e); // 打印错误日志
            return res.status(500).json({
                status: 500,
                message: e.message || "Internal Server Error"
            });
        }
    },
    async GetAllUserInfo(req,res){
        try {
            const users = await usersCollection.aggregate([
                {
                    $project:{
                        _id:1,
                        name:1,
                        phone:1,
                        email:1,
                        role:1,
                        status:1
                    }
                }
            ]).toArray();
            return res.json({
                status:200,
                data:users
            })
        }catch (e){
            return res.status(500).json({
                status: 500,
                message: e.message || "Internal Server Error"
            });
        }
    },
    async UpdateUserStatus(req,res){
        const {user_id,target_status} = req.body;
        try {
            const result = await usersCollection.updateOne(
                { _id: new ObjectId(user_id) },
                { $set: { status: target_status } }
            );
            if (result.matchedCount === 0) {
                return res.status(404).json({
                    status: 404,
                    message: "User not found"
                });
            }
            return res.json({
                status:200,
                message:"修改成功"
            })
        }catch (e){
            return res.status(500).json({
                status: 500,
                message: e.message || "Internal Server Error"
            });
        }
    }

};
