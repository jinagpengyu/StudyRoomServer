process.env.NODE_ENV = 'development';
const { describe, it, expect, beforeAll, afterAll } = require('@jest/globals');
const request = require('supertest');

const {app} =  require('../app')

let token = '';
beforeAll(async () => {
    const response = await request(app)
        .post('/api/login')
        .send({
            email: '1770693883@qq.com',
            password: 'jpy150790'
        })
    expect(response.status).toBe(200);
    token = response.body.token;
})

describe('测试用户接口' , () => {
    it('获取token', async () => {
        expect(token).toBeDefined();
    })

    it('获取 自习室公约', async () => {
        const response = await request(app)
            .post('/user/getAllConvention')
            .set('Authorization', `Bearer ${token}`)
            .set('ContentType','application/json')
        expect(response.status).toBe(200);
        // 数据库中有公告的数据，所以返回的公告的数量不应该为0
        expect(response.body?.data.length).toBeGreaterThan(0);
    })

    it('获取 自习室公告', async () => {
        const response = await request(app)
            .post('/api/getAllPublishNotice')
            .set('Authorization', `Bearer ${token}`)
            .set('ContentType','application/json')
        expect(response.status).toBe(200);
        // 数据库中有公告的数据，所以返回的公告的数量不应该为0
        expect(response.body?.data.length).toBeGreaterThan(0);
    })

    it('获取 自习室2025-05-06的预约情况', async () => {
        const response = await request(app)
            .post('/api/seat/Status')
            .set('Authorization', `Bearer ${token}`)
            .set('ContentType','application/json')
            .send({
                date:'2025-05-06'
            })
        expect(response.status).toBe(200);
        // 一共有30个座位
        expect(response.body?.data.length).toBe(30);
    })

})