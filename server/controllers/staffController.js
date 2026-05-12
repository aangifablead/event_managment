const Staff = require('../models/Staff')

//Get all staff
exports.getStaff = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const search = req.query.search || "";
        const query = {
            adminId: req.user.id,
            $or: [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ]
        };
        const staff = await Staff.find(query)
            .limit(limit)
            .skip((page - 1) * limit)
            .sort({ staffId: 1 }); // Sort by ID 1, 2, 3...
        const total = await Staff.countDocuments(query);
        res.json({
            data: staff,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalEntries: total
        });
    } catch (e) {
        res.status(500).json({ message: "Error fetching data" })
    }
}

// POST: Create staff
exports.createStaff = async (req, res) => {
    try {
        const { email } = req.body;
        const existingStaff = await Staff.findOne({
            email: email.toLowerCase(),
            adminId: req.user.id,
        });
        if (existingStaff) {
            return res.status(400).json({ message: "Staff with this email already exists in your list." });
        }
        const newStaff = new Staff({
            ...req.body,
            email: email.toLowerCase(), // Save as lowercase for consistency
            adminId: req.user.id,
        });

        await newStaff.save();
        res.status(201).json(newStaff);
    } catch (e) {
        res.status(400).json({ message: "Failed to create entry", error: e.message });
    }
};

//PUT:Update
exports.updateStaff = async (req, res) => {
    try {
        const updated = await Staff.findOneAndUpdate(
            { _id: req.params.id, adminId: req.user.id },
            req.body,
            { new: true }
        )
        res.json(updated)
    } catch (e) {
        res.status(400).json({ message: "Updated failed" })
    }
}

//DELETE
exports.deleteStaff = async (req, res) => {
    try {
        const deleted = await Staff.findOneAndDelete({
            _id: req.params.id,
            adminId: req.user.id,
        });

        if (!deleted) {
            return res.status(404).json({ message: "Entry not found or unauthorized" });
        }

        res.json({ message: "Entry deleted successfully" });
    } catch (e) {
        res.status(500).json({ message: "Delete failed" });
    }
};