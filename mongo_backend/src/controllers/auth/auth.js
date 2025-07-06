const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");

exports.post_login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    try {
        const user = await User.findOne({ username, status: '1' })
            .populate('role')
            .populate('location');

        if (!user) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        const location = user.location?._id || null;
        const locationName = user.location?.location || "";

        const token = jwt.sign(
            {
                id: user._id,
                name: user.username,
                email: user.email,
                role: user.role?._id,
                role_name: user.role?.role,
                location: location,
                lname: locationName
            },
            process.env.JWT_SECRET,
            { expiresIn: '10h' }
        );

        res.status(200).json({
            message: "Login successful",
            token,
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "Failed to login" });
    }
};


exports.register = async (req, res) => {
    const { username, password, email, role, location } = req.body;
    if (!username || !password || !email || !role || !location) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            password: hashedPassword,
            email,
            role,
            location,
            status: '1'
        });

        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ error: "Failed to register user" });
    }
};

exports.logout = (req, res) => {
    res.status(200).json({ message: "Logout successful" });
};
