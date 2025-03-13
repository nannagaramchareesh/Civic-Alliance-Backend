import bcrypt from 'bcrypt';
import User from '../models/user.js';
import validator from 'validator';
import jwt from 'jsonwebtoken';
const departmentHeadSignup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let { department } = req.body;
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.json({ success: false, message: "Email already exists" });
        department = department.toLowerCase()
        const existingDepartment = await User.findOne({ department })
        if (existingDepartment) return res.json({ success: false, message: "Department already has a head" });
        if (!validator.isEmail(email)) return res.json({ success: false, message: "Invalid email" });
        if (name.length < 4) return res.json({ success: false, message: "Name must be at least 4 characters" });
        if (password.length < 6) return res.json({ success: false, message: "Password must be at least 6 characters" });
        if (!name) return res.json({ success: false, message: "Name is required" });
        if (!department) return res.json({ success: false, message: "Department is required" });

        // Hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save to database with status "Pending"
        const newUser = User.create({ name, email, password: hashedPassword, department, status: "Pending" });

        res.json({ success: true, message: "Signup request sent for approval" });
    } catch (error) {
        res.json({ success: false, message: "Server error", error });
    }
};

const departmentHeadLogin = async (req, res) => {
    try {
        console.log("HERE")
        const { email, password } = req.body;
        console.log(email, password);
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "Invalid email or password" });
        }
        // Check if user is approved
        if (user.status === "Pending") {
            return res.json({ success: false, message: "Your account is not approved yet" });
        }

        // Check if user is rejected
        if (user.status === "Rejected") {
            return res.json({ success: false, message: "Your account is Rejected" });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        res.json({ success: true, token });
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export { departmentHeadSignup, departmentHeadLogin };
