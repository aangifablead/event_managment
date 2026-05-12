const jwt = require('jsonwebtoken');
exports.protect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided or wrong format" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 
        req.user = decoded;
        next();
    } catch (err) {
        console.error("JWT Verification Error:", err.message); 
        // This will log 'jwt expired' or 'invalid signature' or 'jwt malformed'
        res.status(401).json({ message: "Invalid Token", error: err.message });
    }
};