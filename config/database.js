const mysql = require('mysql2');

// mysql pool
exports.mysql_pool = mysql.createPool({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_DATABASE
})

// 优雅地关闭服务器和连接池
process.on('SIGINT', () => {
    this.mysql_pool.end(err => {
        if (err) {
            return console.error('Error while closing the pool', err.message);
        }
        console.log('Connection pool closed.');
        process.exit(0);
    });
});


