const { getNewCollection } = require('../../config/mongoDB');
const { ObjectId } = require('mongodb')
const OrderSeatService =async (user_id,
                               seat_id,
                               order_data) =>{
    if(await CheckUserOrder(user_id , order_data)){
        return {message:'您已经预约过当天的座位，请勿重复预约！', status : 300}
    }
    if(await CheckSeatOrderStatus(seat_id , order_data)){
        return {message:'该座位已被预约，请选择其他座位！', status : 300}
    }
    await CreateNewOrder(user_id, seat_id, order_data);
    return {message:'预约成功！', status : 200}
}


// 检查用户是否已经预约过当天的座位
const CheckUserOrder = async (user_id, date) => {
    const collection = getNewCollection('orders');
    const results = await collection.find({
        user_id : user_id,
        order_date : date,
        status: "正常"
    }).toArray();
    return results.length > 0;
}

/**
 * 检查指定日期座位的预订状态
 * @param {string} seat_id - 需要查询的座位ID
 * @param {string} date - 需要检查的日期
 * @returns {Promise<boolean>} - 返回true表示已被预订，false表示未找到座位或未预订
 */
const CheckSeatOrderStatus = async (seat_id, date) => {
    /* 获取座位信息集合 */
    const seatsCollection = getNewCollection('seats');
    const orderCollection = getNewCollection('orders');
    /* 根据座位ID查询所有匹配的记录 */
    const results1 = await seatsCollection.find({
        seat_id : seat_id
    }).toArray();

    /* 如果没有找到记录，说明该座位不存在 */
    if(results1.length <= 0){
        return false;
    }
    const results2 = await orderCollection.find({
        seat_id : seat_id,
        order_data: date
    }).toArray();
    /* 检查座位状态是否为可用状态 */
    return results2.length > 0;
}

const CreateNewOrder  = async (user_id, seat_id, order_date) =>{
    const collection = getNewCollection('orders');
    const insertJson = {
        user_id:user_id,
        seat_id:seat_id,
        order_date:order_date,
        create_time:new Date().getTime(),
        status: "正常"
    }
    await collection.insertOne(insertJson);
}



module.exports = {
    OrderSeatService
}