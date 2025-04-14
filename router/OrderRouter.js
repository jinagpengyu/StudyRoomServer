const express = require('express');
const {GetAvailableRecord, GetAllAvailableSeatStatus} = require("./api/SeatInfo");
const SeatsCollection = require('../config/mongoDB').getNewCollection('seats');
const {getNewCollection, collection} = require('../config/mongoDB');
const {NowYYMMDDString} = require('../Tool/MyDate');
const OrderRouter = express.Router();

OrderRouter.get('/Order/Test', async (req,res) => {
    return res.json("test successfully");
})

OrderRouter.post('/Order/Seat/GetAllOrderDate', async (req,res) => {
    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1)
    let afterTomorrow  = new Date(tomorrow);
    afterTomorrow.setDate(tomorrow.getDate() + 1);
    const result = {
        status:200,
        date1:{
            year: tomorrow.getFullYear(),
            month: (tomorrow.getMonth() + 1),
            day: tomorrow.getDate()
        },
        date2:{
            year: afterTomorrow.getFullYear(),
            month: (afterTomorrow.getMonth() + 1),
            day: afterTomorrow.getDate()
        }
    };
    return res.json(result);

})

OrderRouter.post('/Order/Seat/GetSeatInfoByChooseDate', async (req,res)=> {
    const {chooseDate} = req.body;

})
// Customer want to order a seat
OrderRouter.post('/Order/Seat/OrderOneSeat',async (req,res) => {
    const { seat_id , date } = req.body;
    const email = req.cookies.email;
    const collection = require('../config/mongoDB').getNewCollection("seats");

    await collection.insertOne(
        {
            seat_id: seat_id,
            email: email,
            year: date.year,
            month: date.month,
            day: date.day
        });
    const result = await collection.find(
        {
            year: date.year,
            month: date.month,
            day: date.day,
            email: email
        }
    ).toArray();
    return res.json(result);
})

OrderRouter.post('/Order/Seat/availableRecord',async (req,res)=>{
    const {email} = req.body;
    return res.json({status:200,message:await GetAvailableRecord(email)});
})

OrderRouter.post('/Order/Seat/GetAllOrderedSeats',async (req,res) => {
    const {date} = req.body;
    const Seats = [
        {
            seat_id:"1",
            data:{}
        },
        {
            seat_id: "2",
            data:{}
        },
        {
            seat_id: "3",
            data:{}
        }

    ]
    const response = await GetAllAvailableSeatStatus(date);
    for(let i = 0; i < Seats.length ; i++)
    {
        for(let j = 0 ; j < response.length ; j ++)
        {

            if(Seats[i].seat_id === response[j].seat_id)
            {
                Seats[i].data = response;
            }
        }
    }
    return res.json(Seats);
})
//设置座位数
OrderRouter.post('/Order/Seat/SetSeatNum',async (req,res) => {
    const {data} = req.body;
    const collection = getNewCollection('seats');
    await collection.insertOne({
        seat_id: -1,
        seat_num: data
    })
    return res.json({
        status:200,
        message:"设置座位数成功"
    })
})
//换座功能：返回可预约的座位列表
OrderRouter.post('/Order/Seat/NotOrder',async (req,res) => {
    const collection = getNewCollection('seats');
    const {date} = req.body;
    const result = await collection.find({date:date}).toArray();
    const SeatArr = await collection.find({seat_id: -1}).toArray();
    let arr1 = SeatArr[0].seat_num;
    let target = result.map(item => item.seat_id);
    let arr2 = [];
    for(let i = 0 ; i < arr1.length ; i ++){
        if(!target.includes(arr1[i])){
            arr2.push(arr1[i]);
        }
    }
    return res.json({
        status:200,
        data:arr2
    })

})
// 换座功能：换座，把操作写入到数据库中
OrderRouter.post('/Order/Seat/ChangeSeat',async (req,res) => {
    const { originSeat,targetSeat,selectDate} = req.body;
    const email = req.cookies.email;
    const collectionSeat = getNewCollection('seats');
    const collectionOperation = getNewCollection('seat_operation');
    collectionSeat.deleteOne({
        email:email,
        date:selectDate,
        seat_id:originSeat
    }).then(() => {console.log(`删除一条 ${email} 的预约记录`)});
    collectionSeat.insertOne({
        email:email,
        date:selectDate,
        seat_id:targetSeat
    }).then(() => {console.log(`插入一条 ${email} 的预约记录`)});
    await collectionOperation.insertOne({
        email:email,
        operation:"换座",
        originSeat:originSeat,
        targetSeat:targetSeat,
        orderDate:selectDate,
        operation_date:NowYYMMDDString()
    });
    const result = await collectionOperation.find({
        email:email,
        operation:"换座",
        originSeat:originSeat,
        targetSeat:targetSeat,
        orderDate:selectDate,
        operation_date:NowYYMMDDString()
    }).toArray();
    return res.json({
        status:200,
        message:"换座成功",
        data:result[0]
    })
})
//用户预约历史记录模块：获取用户的所有预约历史记录
OrderRouter.post('/user/history/SeatOrder',async (req,res) => {
    const email = req.cookies.email;
    const collection = getNewCollection('seats');
    const result = await collection.find({email:email}).toArray();
    return res.json({
        status:200,
        len:result.length,
        data:result
    })
})
//用户取消预约
OrderRouter.post('/user/cancel/SeatOrder', async (req,res) => {
    const {seat_id,date} = req.body;
    const email = req.cookies.email;
    const collection_operation = getNewCollection('seat_operation');
    const collection_seats = getNewCollection('seats');
    await collection_operation.insertOne({
        email:email,
        seat_id:seat_id,
        order_date:date,
        operation:"取消预约",
        operation_date: NowYYMMDDString()
    });
    await collection_seats.deleteOne({
        email:email,
        seat_id:seat_id,
        date:date
    });
    return res.json({
        status:200,
        message:"取消预约成功"
    })

})

module.exports = OrderRouter;