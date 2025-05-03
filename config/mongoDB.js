const {MongoClient} = require('mongodb');
const mongodb_url = 'mongodb://localhost:27017'
const db_name = 'seats'

const client = new MongoClient(mongodb_url)
client.connect().then(() => {
    console.log('连接成功')
})

const db = client.db('local')
const collection = db.collection(db_name)
const conventionCollection = db.collection('convention')
const reportCollection = db.collection('report')
const orderCollection = db.collection('orders')
const usersCollection = db.collection('users')
const seatCollection = db.collection('seats')
const noticeCollection = db.collection('notice')
const systemCollection = db.collection('system_status')
const getNewCollection = (collection) => {
    return db.collection(collection)
}
module.exports = {
    collection ,
    getNewCollection,
    conventionCollection,
    reportCollection,
    orderCollection,
    usersCollection,
    seatCollection,
    noticeCollection,
    systemCollection
}