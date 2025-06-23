const Role = require("../../models/Role");

exports.get_roles = async (req, res) => {
    try {
        const roles = await Role.find({ status: '1' }).select('id role');
        res.status(200).json(roles);
    } catch (error) {
        console.error("Error fetching roles:", error);
        res.status(500).json({ error: "Failed to fetch roles" });
    }
};
