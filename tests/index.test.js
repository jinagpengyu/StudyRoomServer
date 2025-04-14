const { describe, it, expect, beforeAll, afterAll } = require('@jest/globals');
const request = require('supertest');
const express = require('express');
const app = express(); // 创建一个新的 Express 应用实例

// 添加中间件来解析 JSON 请求体
app.use(express.json());

// 添加 indexRouter 到 app 中
const indexRouter = require('../router/index');
app.use(indexRouter);

let server;

beforeAll(async () => {
    // 启动服务器
    server = app.listen(3000, () => {
        console.log('Server started on port 3000');
    });
});

afterAll(async () => {
    // 关闭服务器
    await server.close();
});

describe('POST /api/login', () => {
    // 测试登录失败的情况
    it('should return 301 if login fails', async () => {
        const response = await request(server) // 使用 server 而不是 app
            .post('/api/login')
            .send({ email: 'test@example.com', password: 'wrongpassword' });

        expect(response.body.status).toBe(301);
        expect(response.body.message).toBe('login fail');
    });

    // 测试用户角色未找到的情况
    it('should return 301 if user role not found', async () => {
        // 模拟 getUserInfo 和 getNewCollection 函数以模拟未找到角色的情况
        jest.mock('../router/api/UserInfo', () => ({
            getUserInfo: jest.fn(() => Promise.resolve({ username: 'testuser' }))
        }));

        jest.mock('../config/mongoDB', () => ({
            getNewCollection: jest.fn(() => ({
                find: jest.fn(() => ({ toArray: jest.fn(() => Promise.resolve([])) }))
            }))
        }));

        const response = await request(server) // 使用 server 而不是 app
            .post('/api/login')
            .send({ email: 'test@example.com', password: 'correctpassword' });

        expect(response.body.status).toBe(301);
        expect(response.body.message).toBe('User role not found');
    });

    // 测试普通用户登录成功的情况
    it('should return 200 with "Hello user!" message for regular user', async () => {
        // 模拟 getUserInfo 和 getNewCollection 函数以模拟普通用户
        jest.mock('../router/api/UserInfo', () => ({
            getUserInfo: jest.fn(() => Promise.resolve({ username: '1770693880@qq.com' }))
        }));

        jest.mock('../config/mongoDB', () => ({
            getNewCollection: jest.fn(() => ({
                find: jest.fn(() => ({ toArray: jest.fn(() => Promise.resolve([{ role: 'user' }])) }))
            }))
        }));

        const response = await request(server) // 使用 server 而不是 app
            .post('/api/login')
            .send({ email: '1770693880@qq.com', password: 'jpy150790' });

        expect(response.body.status).toBe(200);
        expect(response.body.message).toBe('Hello user!');
    });

    // 测试管理员用户登录成功的情况
    it('should return 201 with "Hello admin!" message for admin', async () => {
        // // 模拟 getUserInfo 和 getNewCollection 函数以模拟管理员用户
        // jest.mock('../router/api/UserInfo', () => ({
        //     getUserInfo: jest.fn(() => Promise.resolve({ email: '931930201@qq.com' }))
        // }));
        //
        // jest.mock('../config/mongoDB', () => ({
        //     getNewCollection: jest.fn(() => ({
        //         find: jest.fn(() => ({ toArray: jest.fn(() => Promise.resolve([{ role: 'admin' }])) }))
        //     }))
        // }));

        const response = await request(server) // 使用 server 而不是 app
            .post('/api/login')
            .send({ email: '931930201@qq.com', password: '12345678' });

        expect(response.body.status).toBe(201); // 修改为期望状态码 201
        expect(response.body.message).toBe('Hello admin!');
    });
});