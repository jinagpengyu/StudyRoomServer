const request = require('supertest');
const {describe, it, expect, beforeAll, afterAll} = require("@jest/globals");
const { UpdateOneConvention } = require('../Services/ConventionService')
const {app} = require('../app')
describe('POST /new_convention', () => {
    it('should add a new convention and return success message', async () => {

        const res = await request(app)
            .post('/admin/new_convention')
            .send({
                context:"this is a test",
            });

        expect(res.status).toEqual(200);
    });
    it('获取所有的公约', async () => {

        const res = await request(app)
            .post('/admin/all_convention');
        console.log(res.body)

        expect(res.body.status).toEqual(200);
    });
});

describe('POST /admin/create_reply',() => {
    it('为投诉添加一个新的回复', async () => {
        const result = await  request(app)
            .post('/admin/create_reply')
            .send({
                reply_content:"this is a test",
                report_id:"680311ecf93dc0de2ed76189"
            });
        expect(result.body.status).toEqual(200);
    })
})
