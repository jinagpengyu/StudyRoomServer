const { getNewCollection } = require('../../config/mongoDB')
const { NowYYMMDDString,CompareDate}  = require('../../Tool/MyDate')
const UpdateSeatStatus = async (req,res,next) => {
    const orderCollection = getNewCollection('orders')
    const todayYYMMDD = NowYYMMDDString()
    const result = await orderCollection.find({
        $or:[
            {
                status: '使用中'
            },
            {
                status: '未使用'
            }
        ]
    }).toArray()
    if(result.length > 0){
        for(let i = 0;i < result.length;i++){
            if(CompareDate(result[i].order_date,todayYYMMDD) === -1 && result[i].status !== '已使用'){
                // 日期在今天之前的，状态为未使用或者使用中的，则修改为已使用
                await orderCollection.updateOne({
                    _id:result[i]._id
                },{
                    $set:{
                        status:"已使用"
                    }
                })
            } else if ( CompareDate(result[i].order_date,todayYYMMDD) === 0 && result[i].status === '未使用') {
                // 日期是今天，状态为未使用，则修改为使用中
                await orderCollection.updateOne({
                    _id:result[i]._id
                },{
                    $set:{
                        status:"使用中"
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