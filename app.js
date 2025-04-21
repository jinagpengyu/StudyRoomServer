// const https = require('https')
const session = require('express-session')
// const md5 = require('md5');
const bcrypt = require("bcrypt");

const MySQLStore = require('express-mysql-session')(session);
const express = require('express');
const cors = require('cors')
const cookie_parser = require('cookie-parser')
const body_parser = require('body-parser')
const env = process.env.NODE_ENV || 'development';
require('dotenv').config({ path: `.env.${env}` });
const { mysql_pool } = require('./config/database');

const app = express();
const port = 30002;
// 路由设置
const indexRouter = require('./router/index');
const OrderRouter = require('./router/OrderRouter');
const adminRouter = require('./router/AdminRouter');
// 配置数据库
const db= require('./config/database');
const {query} = require("express");

app.use(body_parser.json())
app.use(cookie_parser())
app.use(cors({ origin: 'http://localhost:5173', credentials:true}))
app.use(session({
    secret: 'jpy150790',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
    // store:sessionStore
}));
app.use(indexRouter);
app.use(OrderRouter);
app.use(adminRouter);

app.listen(port, '0.0.0.0',()=>{
    console.log('server is listen' + port );

})

indexRouter.get('/api/test',(req,res) => {
    console.log('连接成功')
})

module.exports = {
    app
}
