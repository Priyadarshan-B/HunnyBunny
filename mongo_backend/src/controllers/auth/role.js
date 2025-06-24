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

exports.create_role = async (req, res) => {
    try {
        const { role, resources, status } = req.body;

        if (!role || !resources) {
            return res.status(400).json({ error: "Role and resources are required" });
        }

        const newRole = new Role({ role, resources, status });
        const savedRole = await newRole.save();
        res.status(201).json(savedRole);
    } catch (error) {
        console.error("Error creating role:", error);
        res.status(500).json({ error: "Failed to create role" });
    }
};

exports.update_role = async (req, res) => {
    try {
        const roleId = req.params.id;
        const updatedData = req.body;

        const updatedRole = await Role.findByIdAndUpdate(roleId, updatedData, { new: true });

        if (!updatedRole) {
            return res.status(404).json({ error: "Role not found" });
        }

        res.status(200).json(updatedRole);
    } catch (error) {
        console.error("Error updating role:", error);
        res.status(500).json({ error: "Failed to update role" });
    }
};

exports.delete_role = async (req, res) => {
    try {
        const roleId = req.params.id;

        const deletedRole = await Role.findByIdAndUpdate(roleId, { status: '0' }, { new: true });

        if (!deletedRole) {
            return res.status(404).json({ error: "Role not found" });
        }

        res.status(200).json({ message: "Role deleted successfully", role: deletedRole });
    } catch (error) {
        console.error("Error deleting role:", error);
        res.status(500).json({ error: "Failed to delete role" });
    }
};