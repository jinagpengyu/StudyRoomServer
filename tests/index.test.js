const { describe, it, expect, beforeAll, afterAll } = require('@jest/globals');
const request = require('supertest');

const {app} =  require('../app')

describe('POST /user/addNewReport', () => {
    it('should add new report', async () => {
        const result = await request(app)
            .post('/user/addNewReport')
            .send({
                "user_id": "677296a5bbfeeca8e3695b4c",
                "content" : "this is a test"
            })
        expect(result.body.status).toBe(200);

    });
});

describe('POST /user/getAllOrders', () => {
    it('返回该用户的所有预约记录', async () => {
        const result = await request(app)
            .post('/user/getAllOrders')
            .set('Cookie',['email=1770693881@qq.com'])
            .send({
                "user_id": "677296a5bbfeeca8e3695b4c"
            })
        expect(result.body.data.length).toBeGreaterThan(0)
        expect(result.body.status).toBe(200);
    })
})