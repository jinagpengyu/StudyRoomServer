const { GetUserId } = require("../Tool/UserTool");
const { usersCollection } = require('../config/mongoDB');
const { ObjectId } = require("mongodb"); // 假设使用 MongoDB 的 ObjectID

module.exports = {
    async GetOneUserInfo(req, res) {
        const user = req.user;
        try {
            const result = await usersCollection.findOne(
                {_id: new ObjectId(user.user_id)},
                {$project: {password: 0, create_time: 0}}
            )

            if ( !result ) {
                return res.status(400).json({ message: '用户不存在' })
            }

            return res.status(200).json({
                message: '获取用户信息成功',
                data: result
            })
        } catch (e) {
            return res.status(400).json({
                message: "Invalid or expired token"
            })
        }
    },
    async UpdateUsername(req, res) {
        const {  name } = req.body; // 解构请求体参数
        const user = req.user;
        try {
            // 检查输入是否为空
            if ( !name) {
                return res.status(400).json({
                    status: 400,
                    message: "Missing required fields: email or name"
                });
            }


            // 更新用户名
            const result = await usersCollection.updateOne(
                { _id: user.user_id },
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
        const user = req.user;
        const newEmail = req.body.email; // 新邮箱（从请求体中获取）

        try {
            // 1. 输入校验
            if (!newEmail) {
                return res.status(400).json({
                    status: 400,
                    message: "Missing required field: email"
                });
            }

            // 3. 更新邮箱
            const result = await usersCollection.updateOne(
                { _id: new ObjectId(user.user_id) },
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
                    $match:{
                        status:{$ne:'删除'}
                    }
                },
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
    },
    async DeleteUser(req,res){
        const { user_id } = req.body;
        try{
            // 软删除
            const result = await usersCollection.updateOne(
                {_id : new ObjectId(user_id)},
                {$set:{status:'删除'}}
            )
            if(result.matchedCount === 0){
                return res.status(404).json({
                    status: 404,
                    message: "User not found"
                });
            }
            return res.json({
                status:200,
                message:"删除成功"
            })
        }catch (e) {
            console.error(e.message);
            return res.json({
                status: 500,
                message: e.message || "Internal Server Error"
            })
        }
    }

};
