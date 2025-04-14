const { collection } = require('../../config/mongoDB')

const checkDate = (reqStart,reqEnd,start,end) => {
    if(reqEnd < start) {
        return 1;
    }
    if(reqStart > end) {
        return 1;
    }
    return -1;
}

// 输入Date对象的数据
// 输出YYYY-MM-DD的字符串
const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份从0开始，所以加1
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const checkSeatInfo = async (req,res) => {
    const { seat_id , startDate , endDate } = req.body
    const reqStartDate = new Date(startDate);
    const reqEndDate = new Date(endDate);

    console.log(reqStartDate,reqEndDate)

    const queryJson = {
        seat_id:seat_id,
    }
    const rows = await collection.find(queryJson).toArray();
    const len = rows.length

    if(len === 0) {
        res.status(400).json("该座位为空")
        return;
    }
    for ( let i = 0; i < len ; i++) {
        const node = rows[i];
        const checkStart = new Date(node.startDate);
        const checkEnd = new Date(node.endDate);
        if(checkDate(reqStartDate,reqEndDate,checkStart,checkEnd) === -1) {
            res.status(400).json(`该座位在${formatDate(checkStart)}至${formatDate(checkEnd)}时间段内被预约，请选择别的座位`)
            return
        }
        console.log(node)
    }
    res.status(302).json(`该座位在${startDate}至${endDate}时间段可以被预约，预约成功`)
}

const createSeats = (req,res) => {
    const {seat_id,email,startDate,endDate} = req.body
    const insertJson = {
        seat_id : seat_id,
        email: email ,
        startDate:new Date(startDate),
        endDate:new Date(endDate)
    }
    collection.insertOne(insertJson).then(r => {
        res.status(200).json('插入成功')
    });
}

const getSeatInfo = async (req,res) => {
    const {startDate , endDate} = req.body
    console.log(startDate,endDate)
    const pipeline = [
        {
            $match: {
                startDate:{$gte:new Date(startDate)},
                endDate:{$lte:new Date(endDate)}
            }
        },
        // 你可以在这里添加其他聚合操作，比如排序或投影
    ];
    const rows = await collection.aggregate(pipeline).toArray()
    console.log(rows)
    res.status(302).json(rows)
}
// Get user available seat by email
const GetAvailableRecord = async (email) => {
    const collection = require('../../config/mongoDB').getNewCollection('seats');
    const now = new Date();
    now.setDate(now.getDate() + 1);
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);

    const result = await collection.find(
        {
            email:email,
            $or:[
                {
                    year:now.getFullYear(),
                    month:now.getMonth() + 1,
                    day:now.getDate()
                },
                {
                    year:tomorrow.getFullYear(),
                    month:(tomorrow.getMonth() + 1),
                    day:tomorrow.getDate()
                }
            ]
        }
    ).toArray();
    console.log(result);
    return result
}
// Get all seat status info by date
const GetAllAvailableSeatStatus = async (date) => {
    const collection = require('../../config/mongoDB').getNewCollection('seats');
    const result = await collection.find(
        {
            year : date.year,
            month : date.month,
            day : date.day
        }
    ).toArray();
    return result;
}
module.exports = {
    getSeatInfo,
    createSeats,
    checkSeatInfo,
    GetAvailableRecord,
    GetAllAvailableSeatStatus
}