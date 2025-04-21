const { getNewCollection } = require('../../config/mongoDB')
const { NowYYMMDDString,CompareDate}  = require('../../Tool/MyDate')
const UpdateSeatStatus = async (req,res,next) => {
    const orderCollection = getNewCollection('orders')
    const todayYYMMDD = NowYYMMDDString()
    const result = await orderCollection.find({
        status:"正常"
    }).toArray()
    if(result.length > 0){
        for(let i = 0;i < result.length;i++){
            if(CompareDate(result[i].order_date,todayYYMMDD) === -1){
                await orderCollection.updateOne({
                    _id:result[i]._id
                },{
                    $set:{
                        status:"过期"
                    }
                })
            }
        }
    }
    next()
}

const PrintSeatStatus = (req,res,next) => {
    console.log('PrintSeatStatus')
    next()
}

module.exports = {
    UpdateSeatStatus,
    PrintSeatStatus
}