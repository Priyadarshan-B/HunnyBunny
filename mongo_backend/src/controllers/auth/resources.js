const Role = require("../../models/Role");
const Resource = require("../../models/Resource");

exports.get_resources = async (req, res) => {
    const { role } = req.body;

    if (!role) {
        return res.status(400).json({ error: "Role ID is required" });
    }

    try {
        const roleData = await Role.findById(role);
        if (!roleData || !roleData.resources || roleData.resources.length === 0) {
            return res.status(404).json({ error: "No resources found for this role" });
        }

        const resources = await Resource.find({
            _id: { $in: roleData.resources },
            status: '1'
        }).sort({ order_by: 1 });

        res.status(200).json(resources);
    } catch (error) {
        console.error("Error fetching resources:", error);
        res.status(500).json({ error: "Failed to fetch resources" });
    }
};
