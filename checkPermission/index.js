const {mysql_pool} = require("../config/database");

const checkUserRole = async (user_id) => {
    const connection = mysql_pool.promise()
    try{
        const querySql = `
            select roles.role from roles 
            join UserRoles UR on roles.role_id = UR.role_id 
            join study_room.users u on u.user_id = UR.user_id
            where u.user_id = ? 
        `
        const [rows] = await connection.execute(querySql,[user_id])
        if(rows.length === 0) {
            console.error("there is no user")
        }
        return rows[0].role
    }catch (e) {
        console.error('error',e)
    }
}
const checkPermissionWithUserID = async (user_id,requestPermission) => {
    const connection = mysql_pool.promise()
    try{
        const querySql = `
            select permission_name from permissions
            join RolePermissions RP on permissions.permission_id = RP.permission_id
            join UserRoles UR on RP.role_id = UR.role_id
            join users u on u.user_id = UR.user_id
            where u.user_id = ?
        `
        const [row] = await connection.execute(querySql,[user_id])
        if(row.length === 0) {
            return null
        }
        return row[0].permission_name
    }catch (e) {
        console.error('error',e)
    }
}

module.exports = {
    checkUserRole,
    checkPermissionWithUserID
}