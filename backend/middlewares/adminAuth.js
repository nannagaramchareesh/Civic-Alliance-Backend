import jwt from "jsonwebtoken";

const adminAuth = async (req, res, next) => {
    try {
        const token = req.headers["auth-token"];  // Correct way to access headers

        if (!token) return res.json({ success: false, message: "Not Authorized" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded === process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
            next();
        } else {
            res.json({ success: false, message: "Not Authorized" });
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export default adminAuth;
