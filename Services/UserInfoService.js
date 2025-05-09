const { GetUserId } = require("../Tool/UserTool");
const { usersCollection } = require('../config/mongoDB');
const { ObjectId } = require("mongodb");
const {compare, hash} = require("bcrypt"); // 假设使用 MongoDB 的 ObjectID

module.exports = {
    /**
     * 获取单个用户的信息
     * @param req
     *  @param req.user - 通过token获取的user信息，主要存储user_id
     * @param res
     * @returns {Promise<*>}
     * @constructor
     */
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
    /**
     * 获取
     * @param req
     * @param res
     * @returns {Promise<*>}
     * @constructor
     */
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
    /**
     * 管理员修改用户的密码
     * @param req
     * @param res
     * @returns {Promise<*>}
     * @constructor
     */
    async UpdatePassword(req,res) {
        const { update_password , user_id} = req.body;
        try {
            const bcryptPassword = await hash(update_password, 10);
            const result = await usersCollection.updateOne(
                { _id: new ObjectId(user_id) },
                { $set: { password: bcryptPassword } }
            );

            if ( result.matchedCount === 0 ) {
                return res.status(400).json({
                    status: 400,
                    message: "User not found"
                });
            }

            return res.json({
                status: 200,
                message: "Password updated successfully"
            });
        } catch (e) {
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
    /**
     * 删除用户
     * @param req
     *  @param {string} req.user.user_id
     * @param res
     * @returns {Promise<*>}
     * @role admin
     * @constructor
     */
    async DeleteUser(req,res){
        // const { user_id } = req.body;
        const user = req.user;
        try{
            // 软删除
            const result = await usersCollection.updateOne(
                {_id : new ObjectId(user.user_id)},
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
    },
    /**
     * 用户注销自己的账户
     * @param req
     *  @param {string} req.user.user_id mongoDB的唯一ID
     *  @param {string} req.user.password 账户密码
     * @role user - 用户身份要求是user
     * @param res
     * @returns {Promise<*>}
     *  - 注销成功时（200），返回成功数据
     *  - 注销失败时（400），返回失败数据，失败数据包含：
     *    - 修改数据库失败
     *    - 密码不对
     *    - 无权限
     */
    async UserDeleteSelf(req,res){
        try {
            const { password } = req.body;
            const user = req.user;
            let result ;
            result = await usersCollection.findOne({
               _id: new ObjectId(user.user_id)
            });

            const verify = await compare(password,result.password);
            if ( !verify ) {
                return res.status(400).json({
                    message: "密码错误"
                })
            }

            result = await usersCollection.updateOne(
                {_id: new ObjectId(user.user_id)},
                {$set:{status:'删除'}}
            )
            if ( result.matchedCount === 0 ) {
                return res.status(400).json({
                    message: "注销失败"
                })
            }

            return res.status(200).json({
                message: "注销成功"
            })
        } catch (e) {
            return res.status(400).json({
                message: "注销失败"
            })
        }
    }

};
