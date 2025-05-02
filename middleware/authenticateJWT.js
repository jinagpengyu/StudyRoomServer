const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

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
    }
}

