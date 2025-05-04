const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {usersCollection, systemCollection} = require('../config/mongoDB')
const { ObjectId } = require('mongodb')
const system_id = process.env.SYSTEM_ID;

module.exports = {
    async LoginService(req, res) {
        try {
            // 1. 解析请求参数
            const {email, password} = req.body;

            // 2. 查询用户信息
            let user = await usersCollection.findOne({
                email:email
            })
            // 判断客户端的可用状态
            const system = await systemCollection.findOne({
                _id: new ObjectId(system_id)
            })
            if ( !system.client_system && user.role === 'user' ) {
                return res.status(401).json({
                    status: 401,
                    message: '客户端不可用'
                })
            }

            // 3. 验证密码
            const valid = await bcrypt.compare(password, user.password);
            if ( !valid ) {
                return res.status(401).json({
                    status: 401,
                    message: '密码错误'
                })
            }
            // if(user.password !== password){
            //     return res.json({
            //         status: 400,
            //         message: '密码错误'
            //     })
            // }
            // res.cookie('email', email, { httpOnly: true });
            // 4. 生成JWT token
            const token = jwt.sign({
                user:{
                    user_id: user._id,
                    email: user.email,
                    role: user.role
                }
            }, process.env.JWT_SECRET || 'default-secret', {expiresIn: '1d'});

            // 5. 返回登录成功响应
            res.status(200).json({
                token,
                user: {
                    id: user._id, username: user.name, email: user.email,role:user.role
                },
                nav: (user.role === 'user') ? '/user/index' : '/admin/index'
            });

        } catch (error) {
            console.error('登录失败:', error);
            res.status(500).json({message: '服务器内部错误'});
        }
    },
    async RegisterUser(req, res) {
        try {
            // 1. 解析请求参数
            const { email,phone, password, username } = req.body;

            // 2. 参数验证（可扩展更多验证逻辑）
            if (!email || !password || !username || !phone) {
                return res.status(400).json({ message: '邮箱、密码和用户名为必填项' });
            }

            // 3. 检查邮箱是否已存在
            const existingUser = await usersCollection.findOne({
                email: email
            });
            if (existingUser) {
                return res.status(409).json({ message: '该邮箱已被注册' });
            }

            // 4. 密码加密（使用bcrypt替代明文存储）
            const hashedPassword = await bcrypt.hash(password, 10);
            // 5. 创建用户文档
            const newUser = {
                phone: phone,
                email:email,
                password: hashedPassword,
                name: username,
                role: 'user', // 默认角色
                create_time: new Date(),
                status: '正常'
            };

            // 6. 保存到数据库
            const result = await usersCollection.insertOne(newUser);

            // 7. 返回成功响应（不包含密码）
            res.status(200).json({
                status: 200,
                message: '注册成功',
                user: {
                    id: result._id,
                    username: result.name,
                    email: result.email
                }
            });

        } catch (error) {
            console.error('注册失败:', error);
            if (error.code === 11000) { // MongoDB唯一索引冲突
                return res.status(409).json({ message: '该邮箱已被注册' });
            }
            res.status(500).json({ message: '服务器内部错误' });
        }
    },
    async Logout(req, res) {
        try {
            // 验证 Authorization 头
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({
                    status: 401,
                    message: '缺少认证令牌'
                });
            }

            // 清除认证信息（同时处理cookie和可能的服务端会话）
            res.clearCookie('email', {
                httpOnly: true,
                path: '/' // 使cookie在整个站点有效
            });

            // 返回与前端匹配的响应格式
            res.status(200).json({
                status: 200,
                message: '登出成功',
                redirect: '/',
                timestamp: new Date().getTime() // 添加时间戳防止缓存
            });

        } catch (error) {
            console.error('登出失败:', error);
            res.status(500).json({
                status: 500,
                message: '服务器内部错误',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }



};
