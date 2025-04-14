const express = require('express');
const adminRouter = express.Router();
const { getNewCollection } = require('../config/mongoDB')
// 添加一条新公告
adminRouter.post('/admin/new_notice',async (req,res) => {
    const {formData} = req.body;
    console.log(formData);
    const InsertJson = {
        email: req.cookies.email,
        title:formData.title,
        data:formData.data,
        status:formData.status,
        publishDate: formData.publishDate
    }
    const collection = getNewCollection('notice');
    await collection.insertOne(InsertJson);
    return res.json({
        status:200
    });
})
//获取所有公告
adminRouter.post('/admin/get_all_notice',async (req,res) => {
    const collection = getNewCollection('notice');
    const result = await collection.find().toArray();
    if(result.length > 0){
        return res.json({
            status:200,
            data:result
        })
    }
    return res.json({
        status:400,
        data:""
    })
})
// 添加一条新公约
adminRouter.post('/admin/new_convention',async (req,res) => {
    const {formData} = req.body;
    const collection = getNewCollection('convention');
    await collection.insertOne({
        data:formData.data,
        publishDate: formData.publishDate
    });
    return res.json({
        status:200,
        meg:"添加成功"
    })
})
// 返回所有公约
adminRouter.post('/admin/all_convention',async (req,res) => {
    const collection = getNewCollection('convention');
    const result = await collection.find(
        {
            status:{$ne:false}
        }
    ).toArray();
    return res.json({
        status:200,
        data:result
    });
})
//预约一个座位
adminRouter.post('/admin/reserve_seat',async (req,res) => {
    // const {seat_id, email, formDate} = req.body;
    const collection = getNewCollection('seats');
    await collection.insertOne({
        seat_id: "seat-1",
        email: "1770693880@qq.com",
        formDate: (new Date()).toISOString().split('T')[0]
    });
    return res.json({
        status:200
    })
})
//获取某个日期的所有预约座位
adminRouter.post('/admin/get_seat_info',async (req,res) => {
    const { selectDate } = req.body;
    console.log(selectDate);
    const collection = getNewCollection('seats');
    const result1 = await collection.find({
        date: selectDate
    }).toArray();
    const result_seatNum = await collection.find({
        seat_id : -1
    }).toArray();
    let resArr = []

    for (let seatNumElement of result_seatNum[0].seat_num) {
        let status = "Available";
        let email = "";
        for(let bookSeatElement of result1){
            if(seatNumElement === bookSeatElement.seat_id){
                status = "Booked";
                email = bookSeatElement.email;
            }
        }
        if(status === "Available"){
            resArr.push({
                seat_id: seatNumElement,
                status: status
            });
        }else if(status === "Booked"){
            resArr.push({
                seat_id: seatNumElement,
                email: email,
                status: status,
            });
        }
    }
    return res.json({
        status:200,
        data:resArr
    })
})
//获取特定日期的特定座位的预约信息
adminRouter.post('/admin/targetSeatInfo',async (req,res) => {
    const {selectDate,seat_id} = req.body;
    const collection = getNewCollection('seats');
    const result = await collection.find({
        seat_id: seat_id,
        date: selectDate
    }).toArray();
    if(result.length <= 0) {
        return res.json({
            status:400
        })
    }
    return res.json({
        status:200,
        email:result[0].email
    })
})
// 所有的用户信息
adminRouter.post('/admin/get_user_info',async (req,res) => {
    const collection = getNewCollection('users');
    return res.json({
        status:200,
        data:await collection.find().toArray()
    })
})
// 获取用户的所有操作记录
adminRouter.post('/admin/get_user_operation_log',async (req,res) => {
    const {email} = req.body;
    const collection = getNewCollection('seat_operation');
    return res.json({
        status:200,
        data:await collection.find({
            email:email,
        }).toArray()
    })
})
module.exports = adminRouter;