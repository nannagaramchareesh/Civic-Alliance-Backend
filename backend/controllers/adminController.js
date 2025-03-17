import User from '../models/user.js';
import sendMail from '../config/mailer.js';
import jwt from 'jsonwebtoken';
const getPendingRequests = async (req, res) => {
    try {
        const PendingRequests = await User.find({ status: "Pending" });
        res.json({success:true,PendingRequests });
    } catch (error) {
        res.json({success:false, message: "Error fetching pending requests" });
    }
};


const updateStatus = async (req, res) => {
    try {
        const { userId, status } = req.body;

        // Update User Status
        const user = await User.findByIdAndUpdate(userId, { status }, { new: true });

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Email Details
        const emailSubject =
            status === "Approved"
                ? "🎉 Your Department Head Account Has Been Approved!"
                : "🚫 Your Department Head Signup Request Was Rejected";

        const emailBody =
            status === "Approved"
            ? `Dear ${user.name},\n\nCongratulations! Your signup request as a Department Head has been approved.\n\nYou can now log in here: ${process.env.FRONTEND_URL}/login.\n\nThank you.`
            : `Dear ${user.name},\n\nWe regret to inform you that your signup request has been rejected. For more details, please contact support.\n\nThank you.`;
        console.log("📨 Sending email with Subject:", emailSubject);
        await sendMail(user.email, emailSubject, emailBody);

        res.json({ success: true, message: `User ${status.toLowerCase()} successfully` });
    } catch (error) {
        console.error("❌ Error updating user status:", error.message);
        res.json({ success: false, message: "Error updating user status", error });
    }
};


const getDashboardStats = async (req, res) => {
    console.log("📊 Fetching Dashboard Stats");
    try {
        const pendingCount = await User.countDocuments({ status: "Pending" });
        const approvedCount = await User.countDocuments({ status: "Approved" });
        const rejectedCount = await User.countDocuments({ status: "Rejected" });

        const recentActivity = await User.find({ status: { $in: ["Approved", "Rejected"] } })
            .sort({ updatedAt: -1 }) // Get latest activity first
            recentActivity.reverse()
        res.json({ 
            success: true, 
            stats: { pendingCount, approvedCount, rejectedCount },
            recentActivity
        });
    } catch (error) {
        res.json({ success: false, message: "Error fetching dashboard data" });
    }
};

const authenticateAdmin = async(req,res)=>{
    try {
        const {email,password} = req.body;
        if(email===process.env.ADMIN_EMAIL && password===process.env.ADMIN_PASSWORD){
            const payload = email+password;
            const token = jwt.sign(payload,process.env.JWT_SECRET)
            res.json({success:true,token})
        }
        else{
            res.json({success:false,message:"Not Authorized"})
        }
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

const deleteAllUsers = async(req,res)=>{
    try {
        await User.deleteMany({});
        res.json({success:true,message:"successfully deleted all users"})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

const getApprovedUsers = async (req, res) => {
    try {
        const users = await User.find({ status: { $in: ["Approved", "Rejected"] } });
        res.json({ success: true, users });
    } catch (error) {
        res.json({ success: false, message: "Error fetching approved users" });
    }
};


//deactivate
const changeStatus = async (req, res) => {
    try {
        const { userId } = req.body;
        const {status} = req.body;
        const user = await User.findByIdAndUpdate(userId, { status: status }, { new: true });

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        const emailSubject =
            status === "Approved"
                ? "🎉 Your Department Head Account Has Been Activated!"
                : "🚫 Your Department Head Account had been Deactivated";

        const emailBody =
            status === "Approved"
            ? `Dear ${user.name},\n\nCongratulations! Your Account has been Activated.\n\nYou can now log in here: ${process.env.FRONTEND_URL}/login.\n\nThank you.`
            : `Dear ${user.name},\n\nWe regret to inform you that your Account has been Deactivated. For more details, please contact support.\n\nThank you.`;
        await sendMail(user.email, emailSubject, emailBody);
        res.json({ success: true, user });
    } catch (error) {
        console.error("Error changing user status:", error.message);
        res.json({ success: false, message: "Error changing user status" });
    }
}

export { getPendingRequests, updateStatus ,getDashboardStats,authenticateAdmin,deleteAllUsers,getApprovedUsers,changeStatus};
