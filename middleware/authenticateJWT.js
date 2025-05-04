const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const system_id = process.env.SYSTEM_ID;
const {
    systemCollection,
    orderCollection
} = require('../config/mongoDB');
const { ObjectId } = require('mongodb');
const MyDateTool = require('../Tool/MyDate');
module.exports = {
    authenticateJWT (req, res, next) {
        // 从请求头中获取 Authorization 字段
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1]; // 提取 token

            try {
                // 验证并解析 token
                const { user } = jwt.verify(token, JWT_SECRET);

                // 将解析出的用户信息挂载到 req.user 上，供后续路由使用
                req.user = user;

                // 继续执行下一个中间件或路由处理
                next();
            } catch (err) {
                // Token 无效或过期
                return res.status(403).json({ message: 'Invalid or expired token' });
            }
        } else {
            // 没有提供 token
            return res.status(401).json({ message: 'Access token is required' });
        }
    },
    async verifyRoleAsync (req, res, next) {
        const user = req.user;
        try {
            if (!user || user.role !== 'admin') {
                return res.status(403).json({ message: 'Access denied' });
            }
            next();
        } catch (e) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
    },
    async updateSeatStatus (req, res, next) {
        try {
            let result;
            result = await systemCollection.findOne({
                system_id: new ObjectId(system_id),
                seat_update_time: MyDateTool.GetSelectDate().todayDate
            });

            if ( !result ) {
                // 将日期在今天之前的所有使用中或未使用作为设置为已使用
                result = await orderCollection.updateMany(
                    {
                        order_date: {
                            $lt: MyDateTool.GetSelectDate().todayDate
                        },
                        status: {
                            $in: ['使用中']
                        }
                    },
                    {
                        $set: {
                            status: '已使用'
                        }
                    }
                );
                // 将日期在今天的未使用设置为使用中
                result = await orderCollection.updateMany(
                    {
                        order_date: MyDateTool.GetSelectDate().todayDate,
                        status: '未使用'
                    },
                    {
                        $set: {
                            status: '使用中'
                        }
                    }
                );
            }

        } catch (e) {
            console.error('更新数据失败')
        } finally {
            await systemCollection.updateOne(
                {
                    system_id: new ObjectId(system_id)
                },
                {
                    $set: {
                        seat_update_time: MyDateTool.GetSelectDate().todayDate
                    }
                }
            )
            next();
        }
    }
}

