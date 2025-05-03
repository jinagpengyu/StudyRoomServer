const { systemCollection } = require('../config/mongoDB');
const { ObjectId } = require('mongodb');
const system_id = process.env.SYSTEM_ID;
module.exports = {
    async GetClientStatus(req,res) {
        try {
            const result = await systemCollection.findOne(
                {
                _id: new ObjectId(system_id)
                }
            )

            if (result === null) {
                return res.status(404).json({
                    message: "System not found"
                })
            }

            return res.status(200).json({
                status: result.client_system
            })
        } catch (e) {
            return res.status(403).json({
                message: e.message ||"Internal Server Error"
            })
        }
    },
    async UpdateClientStatus(req,res) {
        try {
            const { system_status } = req.body;
            if ( system_status === undefined ) {
                return res.status(400).json({
                    message: "Invalid request"
                })
            }

            const result = await systemCollection.updateOne(
                {
                    _id: new ObjectId(system_id)
                },
                {
                    $set: {
                        client_system: system_status
                    }
                }
            )

            if ( result.matchedCount === 0 ) {
                return res.status(403).json({
                    message: "Invalid request"
                })
            }

            return res.status(200).json({
                message: "System status updated successfully"
            })
        } catch (e) {
            return res.status(403).json({
                message: e.message ||"Internal Server Error"
            })
        }
    }
}