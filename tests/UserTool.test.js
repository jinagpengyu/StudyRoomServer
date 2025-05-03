
const {
    describe,
    it,
    expect,
    beforeAll,
    afterAll,
    beforeEach,
    afterEach,
} = require('@jest/globals');
// const { jest } = require('@jest/globals');
const request = require('supertest');
const {GetChinaDate} = require('../Tool/MyDate')
// const {app} =  require('../app')
const UserTool = require('../Tool/UserTool');
const MyDateTool = require('../Tool/MyDate')
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

    it('测试 GetSelectDate 函数',() => {
        const selectDate = MyDateTool.GetSelectDate();
        expect(selectDate.todayDate).toBe('2025-04-20')
    })

});
const { GetSelectDate } = require('../Tool/MyDate');
describe('GetSelectDate', () => {
    // 固定测试时间：2025-04-20T15:30:00+08:00

    it('应返回正确的 YYYY-MM-DD 格式', () => {
        const result = GetSelectDate();
        expect(result.todayDate).toBe('2025-04-29');
        expect(result.tomorrowDate).toBe('2025-04-30');
    });

});