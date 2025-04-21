const { getNewCollection } = require('../config/mongoDB')
const { NowYYMMDDString } = require('../Tool/MyDate')
const conventionSchema ={
    context : {
        type : String,
        required : true
    },
    status: {
        type : String,
        required : true
    },
    publishDate : {
        type : Number,
        required : true
    }
}

module.exports = {
    async InsertNewConvention(data){
        const insertJson = {
            context :data,
            status: "发布",
            publishDate : NowYYMMDDString()
        }

    }
}
