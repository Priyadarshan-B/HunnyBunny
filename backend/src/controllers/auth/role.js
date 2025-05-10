const {get_database} = require("../../config/db_utils");

exports.get_roles = async (req, res) => {
    try {
        const query = `SELECT id, role FROM roles WHERE status = ?`;
        const params = ['1'];
        const result = await get_database(query, params);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch roles" });
    }
}