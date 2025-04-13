import bcrypt from 'bcrypt';
import User from '../models/user.js';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import Project from '../models/Project.js';
import Officer from '../models/Officer.js';
import sendMail from '../config/mailer.js';
import { request } from 'express';

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
        const { email, password } = req.body;
        console.log(email, password)
        let user = await User.findOne({ email }); // Check if it's a Department Head
        let role = "Department Head";
        if (!user) {
            user = await Officer.findOne({ email }); // If not found, check if it's an Officer
            role = "Officer";
        }

        if (!user) {
            return res.json({ success: false, message: "Invalid email or password" });
        }

        // Check if Department Head is approved
        if (role === "Department Head" && user.status === "Pending") {
            return res.json({ success: false, message: "Your account is not approved yet" });
        }
        if (role === "Department Head" && user.status === "Rejected") {
            return res.json({ success: false, message: "Your account is rejected" });
        }

        // Verify Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid email or password" });
        }

        // Generate JWT token with user ID and role
        const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET);

        res.json({ success: true, token, user, role });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};




const addProject = async (req, res) => {
    try {
        console.log("Received req body",req.body);

        const { projectName, description, location, startDate, endDate, resourcesNeeded, collaboratingDepartments, department, priority } = req.body;

        // Validate required fields
        if (!projectName || !description || !location || !startDate || !endDate) {
            return res.json({ success: false, message: "All fields are required" });
        }

        // Fetch all existing projects to compare priorities
        const existingProjects = await Project.find({});
        console.log(existingProjects)
        // console.log("hello")
        // Check if any existing project has a lower priority
        const lowerPriorityExists = existingProjects.some(proj => proj.priority < priority);
        //checking priority
        if (lowerPriorityExists) {
            return res.json({ success: false, message: "A lower-priority project already exists. Cannot proceed." });
        }

        // Prepare collaborating departments for request
        const collaborationRequests = collaboratingDepartments.map((dept) => ({
            name: dept.name,
            startDate: new Date(dept.startDate),
            endDate: new Date(dept.endDate),
            status: "pending" // Default status is pending approval
        }));
        // console.log(collaborationRequests)
        // Create new project
        const priorityval=Number(priority)
        const newProject = new Project({
            projectName,
            description,
            location,
            startDate,
            endDate,
            department,
            resourcesNeeded,
            priority:priorityval, // Assigning priority to project
            collaborationRequests: collaborationRequests,
            createdBy: req.user.id // Department Head's ID
        });
        // console.log(newProject)
        // Save project
        await newProject.save();

        res.json({ success: true, message: "Project created successfully", project: newProject });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Server Error" });
    }
};

const viewProject = async (req, res) => {
    try {
        console.log(req.user)
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
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt);
        const data = await Officer.create({ name, email, hashedPassword });
        const emailSubject = "👮 Your Officer Account Has Been Created!";

        const emailBody = `Dear ${name},\n\nWelcome to the system! Your Officer account has been successfully created.\n\n🔹 **Login Details**:\n📧 Email: ${email}\n🔑 Password: ${password}\n\n🚀 You can log in here: ${process.env.FRONTEND_URL}/login\n\nPlease change your password after logging in.\n\nBest Regards,\nAdmin Team`;

        await sendMail(email, emailSubject, emailBody);

        res.json({ success: true, message: "officer added successfully" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get project details by ID
const getProjectDetails = async (req, res) => {
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

const getCollaborationRequests = async (req, res) => {
    try {
        const departmentName = req.user.department; // Assuming department is stored in token
        const { status } = req.query;  // Use req.query instead of req.body

        // Find projects where this department is requested for collaboration with the given status
        const projects = await Project.find({
            "collaborationRequests.name": departmentName,
            "collaborationRequests.status": status,
        });
        console.log(projects)
        // Extract relevant collaboration requests
        const requests = projects.flatMap((project) =>
            project.collaborationRequests
                .filter((dept) => dept.name === departmentName && dept.status === status)
                .map((dept) => ({
                    projectId: project._id,
                    projectName: project.projectName,
                    requestedBy: project.department,
                    startDate: dept.startDate,
                    endDate: dept.endDate,
                    status: dept.status,
                }))
        );

        res.json({ success: true, requests });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};


const changeCollaborationRequestStatus = async (req, res) => {
    try {

        console.log("HITTING changestatus")
        const { projectId } = req.params;
        const { departmentName, status } = req.body; // Use departmentName instead of departmentId

        if (!departmentName || !status) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        console.log(projectId,departmentName)

        console.log(departmentName)
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        // Find the request in the project's collaboratingDepartments array
        const requestIndex = project.collaborationRequests.findIndex(
            (req) => req.name === departmentName // Match by department name
        );

        console.log(requestIndex)
        if (requestIndex === -1) {
            return res.status(404).json({ error: "Collaboration request not found" });
        }

        // Update request status
        project.collaborationRequests[requestIndex].status = status;

        // If approved, add department to the project's `collaboratingDepartments` array
        if (status === "approved") {
            project.collaboratingDepartments.push({ 
                name: departmentName, 
                startDate: new Date(), 
                endDate: null, 
                status: "approved" 
            });
        }

        await project.save();

        res.json({ message: `Collaboration request ${status} successfully`, departmentName, project });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}

const getCollaborationRequestsByDepartment = async (req, res) => {
    try {
        console.log("HELLO sent")
        const departmentName = req.user.department; // Fetching department from authenticated user

        // Find projects created by the department that have sent collaboration requests
        const projects = await Project.find({ department: departmentName });
        // Extract sent collaboration requests
        const sentRequests = projects.flatMap((project) =>
            project.collaborationRequests.map((req) => ({
                projectId: project._id,
                projectName: project.projectName,
                departmentRequested: req.name,
                requestDate: project.createdAt,
                status: req.status,
            }))
        );
        console.log(sentRequests)
        res.json({ success: true, requests: sentRequests });
    } catch (err) {
        console.error("Error fetching sent collaboration requests:", err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}


export { departmentHeadSignup, departmentHeadLogin, addProject, viewProject, addOfficer, getProjectDetails ,getCollaborationRequests,changeCollaborationRequestStatus,getCollaborationRequestsByDepartment};