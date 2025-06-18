const {post_database, get_database} = require("../../config/db_utils");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.post_login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    try {
        const query = `SELECT id, username, email, password, role FROM users WHERE username = ? AND status = ?`;
        const params = [username, '1'];
        const result = await get_database(query, params);

        if (result.length === 0) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        const user = result[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        const token = jwt.sign({ id: user.id, name:user.username, email:user.email, role:user.role }, process.env.JWT_SECRET, { expiresIn: '10h' });

        res.status(200).json({ message: "Login successful", token});
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "Failed to login" });
    }
}

exports.register = async (req, res) => {
    const { username, password, email, role } = req.body;
    if (!username || !password || !email || !role) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)`;
        const params = [username, hashedPassword, email, role];
        await post_database(query, params);

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ error: "Failed to register user" });
    }
}

exports.logout = (req, res) => {
    res.status(200).json({ message: "Logout successful" });
}