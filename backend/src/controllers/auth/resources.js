const {get_database} = require("../../config/db_utils");

exports.get_resources = async (req, res) => {
    const {role} = req.body; 
    if (!role) {
        return res.status(400).json({ error: "Role ID is required" });
    }
    try {
        const query = `SELECT rs.name, rs.icon, rs.path, rs.order_by
        FROM roles r
        JOIN resources rs ON FIND_IN_SET(rs.id, r.resources)
        WHERE r.id =?
        AND rs.status = ? 
        ORDER BY order_by`;
        const params = [role,'1'];
        const result = await get_database(query, params);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch resources" });
    }
}