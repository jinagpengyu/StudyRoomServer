const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// const User = require('../models/User'); // 假设存在用户模型
const {usersCollection} = require('../config/mongoDB')

module.exports = {
    async LoginService(req, res) {
        try {
            // 1. 解析请求参数
            const {email, password} = req.body;

            // 2. 查询用户信息
            let user = await usersCollection.findOne({
                email:email
            })

            // 3. 验证密码
            // const valid = await bcrypt.compare(password, user.password);
            if(user.password !== password){
                return res.json({
                    status: 400,
                    message: '密码错误'
                })
            }
            res.cookie('email', email, { httpOnly: true });
            // 4. 生成JWT token
            const token = jwt.sign({
                userId: user._id,
                username: user.email,
                role:user.role
            }, process.env.JWT_SECRET || 'default-secret', {expiresIn: '1h'});

            // 5. 返回登录成功响应
            res.status(200).json({
                token,
                user: {
                    id: user._id, username: user.name, email: user.email
                },
                nav: (user.role === 'user') ? '/user/index' : '/admin/index'
            });

        } catch (error) {
            console.error('登录失败:', error);
            res.status(500).json({message: '服务器内部错误'});
        }
    }
};
