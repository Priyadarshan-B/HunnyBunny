const { post_database, get_database } = require("../../config/db_utils");

exports.get_quantity = async(req, res) => {
    try{
        const query = `
        SELECT id, quantity , expansion
        FROM quantity
        WHERE status = ?
        `
        const params = ['1']
        const result = await get_database(query, params)
        return res.status(200).json(result)
    }
    catch(err){
        return res.status(500).json({error: "Failed to fetch quantity"})
    }
}