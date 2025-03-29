import bcrypt from 'bcrypt';
import User from '../models/user.js';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import Project from '../models/Project.js';
import Officer from '../models/Officer.js';
import sendMail from '../config/mailer.js';

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
        const newUser = await User.create({ name, email, password: hashedPassword, department, status: "Pending" });

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
        res.json({ success: true, token, user });
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}


const addProject = async (req, res) => {
    try {
        const { projectName, department, location, description, startDate, endDate, resourcesNeeded, interDepartmental } = req.body;
        const id = req.user._id;
        const project = await Project.create({ projectName, department, location, description, startDate, endDate, resourcesNeeded, interDepartmental, createdBy: id });
        res.json({ success: true, project, message: "Project Added Successfully" });
    }
    catch (error) {
        res.json({ success: false, message: error.message })
    }
}
const viewProject = async (req, res) => {
    try {
        const projects = await Project.find({});
        res.json({ success: true, projects })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const addOfficer = async (req, res) => {

    console.log("Hitting add officer")
    try {
        // const data=await Officer.create({req.body})
        const { officerData } = req.body;
        const { name, email, password } = officerData;
        const check = await Officer.findOne({ email });
        if (check) return res.json({ success: false, message: "Email already exists" })
        console.log(name)
        const data = await Officer.create({ name, email, password });
        const emailSubject = "👮 Your Officer Account Has Been Created!";

        const emailBody = `Dear ${name},\n\nWelcome to the system! Your Officer account has been successfully created.\n\n🔹 **Login Details**:\n📧 Email: ${email}\n🔑 Password: ${password}\n\n🚀 You can log in here: ${process.env.FRONTEND_URL}/login\n\nPlease change your password after logging in.\n\nBest Regards,\nAdmin Team`;

        await sendMail(email, emailSubject, emailBody);

        res.json({ success: true, message: "officer added successfully" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get project details by ID
const getProjectDetails = async(req,res)=>{
    try {
        const { id } = req.params;
    
        // Find project by ID
        const project = await Project.findById(id);
    
        if (!project) {
          return res.status(404).json({ message: "Project not found" });
        }
    
        res.json({ project });
      } catch (error) {
        console.error("Error fetching project details:", error);
        res.status(500).json({ message: "Server Error" });
      }
}

module.exports=router;

export { departmentHeadSignup, departmentHeadLogin, addProject, viewProject, addOfficer,getProjectDetails };
