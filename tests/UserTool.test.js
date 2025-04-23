
const { describe, it, expect, beforeAll, afterAll } = require('@jest/globals');
const request = require('supertest');
const {GetChinaDate} = require('../Tool/MyDate')
// const {app} =  require('../app')
const UserTool = require('../Tool/UserTool');
describe('POST /user/addNewReport', () => {
    it('should add new report', async () => {
        const utcTime = new Date().getTime();
        const result = await UserTool.GetFormatedDate(utcTime)
        expect(result).toBe('2025-04-20')

    });

    it('测试 GetChinaDate 函数', () => {
        const chinaDate = GetChinaDate()
        console.log(chinaDate)
    })

});