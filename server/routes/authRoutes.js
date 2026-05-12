const express = require('express')
const router = express.Router()
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

//SIGNUP
router.post('/signup', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        // 1. Check if user exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User Already Exists." });

        // 2. Hash Password (FIXED: use bcrypt.hash)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create Model Instance (FIXED: use 'new User')
        user = new User({
            fullName,
            email,
            password: hashedPassword
        });

        await user.save();
        res.status(201).json({ message: "User created successfully" });
    } catch (err) {
        console.error(err); // Always log the error to your terminal for debugging!
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

//LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: "Invalid credential" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Credential" });

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        // CHANGE THIS PART:
        res.json({
            token,
            user: {
                id: user.userId,      // This will now show 1, 2, 3...
                mongoId: user._id,    // Keep this hidden or as a separate key if needed for API calls
                name: user.fullName,
                email: user.email,
                role: 'Admin'
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});
module.exports = router;