import jwt from "jsonwebtoken";
import User from '../models/user.js';

const departmentHeadAuth = async (req, res, next) => {
    try {
        const token = req.headers["auth-token"];

        if (!token) {
            return json({ success: false, message: "Not Authorized" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Fetch user from DB to ensure they exist & are approved
        const user = await User.findById(decoded.id);
        
        if (!user || user.status !== "Approved") {
            return res.status(403).json({ success: false, message: "Access denied. User not approved or does not exist." });
        }

        req.user = user; // Attach user to request object
        next();
    } catch (error) {
        res.json({ success: false, message: "Invalid or expired token" });
    }
};

export default departmentHeadAuth;
