
const { describe, it, expect, beforeAll, afterAll } = require('@jest/globals');
const request = require('supertest');

// const {app} =  require('../app')
const UserTool = require('../Tool/UserTool');
describe('POST /user/addNewReport', () => {
    it('should add new report', async () => {
        const utcTime = new Date().getTime();
        const result = await UserTool.GetFormatedDate(utcTime)
        expect(result).toBe('2025-04-20')

    });

});