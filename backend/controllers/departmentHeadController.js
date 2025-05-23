import bcrypt from 'bcrypt';
import User from '../models/user.js';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import Project from '../models/Project.js';
import Officer from '../models/Officer.js';
import Task from '../models/Task.js'
import sendMail from '../config/mailer.js';
import Message from '../models/Message.js';
const conflictMessages = {
    "sewage_pipeline": "Sewage should be laid before pipeline to avoid contamination or damage. Reschedule accordingly.",
    "sewage_water": "Sewage lines must precede water to prevent cross-contamination risks.",
    "sewage_electricity": "Sewage infrastructure was planned earlier. Constructing electricity afterward may disrupt the system.",
    "sewage_road": "Sewage infrastructure was planned earlier. Constructing road afterward may disrupt the system.",
    "sewage_pavement": "Sewage infrastructure was planned earlier. Constructing pavement afterward may disrupt the system.",
    "sewage_landscaping": "Sewage infrastructure was planned earlier. Constructing landscaping afterward may disrupt the system.",
    
    "sewer_pipeline": "Sewer should be laid before pipeline to avoid contamination or damage. Reschedule accordingly.",
    "sewer_water": "Sewer lines must precede water to prevent cross-contamination risks.",
    "sewer_electricity": "Sewer infrastructure was planned earlier. Constructing electricity afterward may disrupt the system.",
    "sewer_road": "Sewer infrastructure was planned earlier. Constructing road afterward may disrupt the system.",
    "sewer_pavement": "Sewer infrastructure was planned earlier. Constructing pavement afterward may disrupt the system.",
    "sewer_landscaping": "Sewer infrastructure was planned earlier. Constructing landscaping afterward may disrupt the system.",
    
    "pipeline_water": "Pipeline should be laid before water to ensure proper placement and avoid damage.",
    "pipeline_electricity": "Pipeline infrastructure was planned earlier. Constructing electricity afterward may cause interference.",
    "pipeline_road": "Pipeline should be laid before roads to avoid disturbing the surface once it's built.",
    "pipeline_pavement": "Pipeline should be laid before pavement to ensure smooth future repairs and avoid damage.",
    "pipeline_landscaping": "Pipeline should be laid before landscaping to avoid disturbing aesthetic work later.",
    
    "water_electricity": "Water supply systems should be completed before electricity infrastructure to avoid disruption during construction.",
    "water_road": "Water infrastructure should be laid before roads to prevent surface disturbance later.",
    "water_pavement": "Water infrastructure should be laid before pavement for smoother future maintenance.",
    "water_landscaping": "Water infrastructure should be laid before landscaping to avoid disturbing aesthetic work later.",
    
    "electricity_road": "Electricity cabling should be laid before roads to avoid roadwork disruption.",
    "electricity_pavement": "Electricity cabling should be laid before pavement to avoid disturbing footpaths later.",
    "electricity_landscaping": "Electricity infrastructure should be laid before landscaping to avoid disturbing aesthetic work later.",
    
    "road_pavement": "Roadwork must be completed before pavement to avoid surface disturbances later.",
    "road_landscaping": "Roadwork must be completed before landscaping to avoid disturbing aesthetics.",
    
    "pavement_landscaping": "Pavement should be completed before landscaping to ensure better alignment of aesthetic elements."
  };
  
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




const departmentHeadLogin  = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check in User (Department Head)
        let user = await User.findOne({ email });
        let role = "Department Head";

        // If not found, check in Officer
        if (!user) {
            user = await Officer.findOne({ email });
            role = "Officer";
        }

        if (!user) {
            return res.json({ success: false, message: "Invalid email or password" });
        }

        // Check account status (for both roles)
        if (user.status === "Pending") {
            return res.json({ success: false, message: "Your account is not approved yet" });
        }

        if (user.status === "Rejected") {
            return res.json({ success: false, message: "Your account has been rejected" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid email or password" });
        }

        // Generate token
        const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // Success response
        res.json({
            success: true,
            token,
            user,
            role
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};




const normalizeCategory = (high,low) => {
    high = high.toLowerCase();
    low = low.toLowerCase();

    return low+"_" + high;
};


const formatDate = (date) => {
    date = new Date(date);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth() is zero-indexed
    const year = date.getFullYear();

    const formatted = `${day}/${month}/${year}`;
    return formatted

}


const addProject = async (req, res) => {
    try {
        console.log(req.body)
        const { projectName, description, location, startDate, endDate, resourcesNeeded, collaboratingDepartments, department, priority,category } = req.body.updatedProjectData;
        // Check if required fields are present
        console.log(collaboratingDepartments)
        const existingProjects = await Project.find({});
        const role = req.body.role;
        let status = "pending";
        if(role==='Department Head')status = "approved";
        const projectStart = new Date(startDate);
        const projectEnd = new Date(endDate);
        let conflictingProject = null;
        
        // Check for conflicts based on priority and project timeline
        let locationConflict = null;
        for (const proj of existingProjects) {
            const existingStart = new Date(proj.startDate);
            const existingEnd = new Date(proj.endDate);
            // Check if project has a higher priority, overlaps in the same location, and within the same time range
         
            if (proj.priority > priority && existingStart < projectStart && existingEnd < projectStart) {
                conflictingProject = proj;
                break;
            }

            

            // Check if there are projects with the same location and overlapping time period
            if (proj.location === location && 
                ((existingStart <= projectStart && existingEnd >= projectStart) || 
                (existingStart <= projectEnd && existingEnd >= projectEnd) || 
                (existingStart >= projectStart && existingEnd <= projectEnd))) {
                    locationConflict = proj;
                    break;
            }
        }
        if (conflictingProject) {
            const type = normalizeCategory(conflictingProject.category, category);
            const conflictMessage = conflictMessages[type];
            const high = conflictingProject.category;
            const low = category;
            const title = low + '-' + high + " Priority Conflict";
            return res.json({ success: false, message: conflictMessage, title });
        }
        if(locationConflict) {
            const type = normalizeCategory(locationConflict.category, category);
            return res.json({success:false,message:`A ${locationConflict.category} project is already planned at this location from ${formatDate(startDate)} to ${formatDate(endDate)}. Overlapping projects are not allowed. Please revise your plan`, title:'Location Conflict',});
        }
        // Prepare collaborating departments for request
        const collaborationRequests = collaboratingDepartments.map((dept) => ({
            name: dept.name,
            startDate: new Date(dept.startDate),
            endDate: new Date(dept.endDate),
            status: "pending" // Default status is pending approval
        }));
       
        const priorityval = Number(priority);
        const newProject = new Project({
            projectName,
            description,
            location,
            startDate,
            endDate,
            department,
            resourcesNeeded,
            priority: priorityval, // Assigning priority to project
            collaborationRequests: collaborationRequests,   
            category:category,
            status
        });
     
        await newProject.save();

        res.json({ success: true, message: "Project created successfully", project: newProject });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Server Error" });
    }
};


const viewProject = async (req, res) => {
    try {
        const projects = await Project.find({ status: "approved" });
        res.json({ success: true, projects })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const addOfficer = async (req, res) => {
    try {
        const { officerData ,department} = req.body;
        const { name, email, password } = officerData;

        // Check if officer already exists
        const check = await Officer.findOne({ email });
        if (check) return res.json({ success: false, message: "Email already exists" });

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save officer with proper password field
        const data = await Officer.create({ name, email, password: hashedPassword ,department});

        // // Email content
        // const emailSubject = "👮 Your Officer Account Has Been Created!";
        // const emailBody = `Dear ${name},\n\nWelcome to the system! Your Officer account has been successfully created.\n\n🔹 **Login Details**:\n📧 Email: ${email}\n🔑 Password: ${password}\n\n🚀 You can log in here: ${process.env.FRONTEND_URL}/login\n\nPlease change your password after logging in.\n\nBest Regards,\nAdmin Team`;

        // await sendMail(email, emailSubject, emailBody);

        res.json({ success: true, message: "Officer added successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};


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
        const departmentName = req.body.department; // Assuming department is stored in token
        const { status } = req.query;  // Use req.query instead of req.body
        console.log(departmentName)
        // Find projects where this department is requested for collaboration with the given status
        const projects = await Project.find({
            "collaborationRequests.name": departmentName,
            "collaborationRequests.status": status,
        });
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

        const { projectId } = req.params;
        const { departmentName, status ,message} = req.body; // Use departmentName instead of departmentId
        console.log(message);
        if (!departmentName || !status||!message) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        // Find the request in the project's collaboratingDepartments array
        const requestIndex = project.collaborationRequests.findIndex(
            (req) => req.name === departmentName // Match by department name
        );

        if (requestIndex === -1) {
            return res.status(404).json({ error: "Collaboration request not found" });
        }

        // Update request status
        project.collaborationRequests[requestIndex].status = status;
        project.collaborationRequests[requestIndex].message = message;
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

        res.json({ message: `Collaboration request ${status} successfully`, departmentName, project ,message});

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}

const getCollaborationRequestsByDepartment = async (req, res) => {
    try {
        const departmentName = req.body.department// Fetching department from authenticated user
    
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
                message:req.message
            }))
        );
        res.json({ success: true, requests: sentRequests });
    } catch (err) {
        console.error("Error fetching sent collaboration requests:", err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}


const addMessage = async (req, res) => {
    try {
        const messages = await Message.find().sort({ timestamp: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
}

const updateLikes = async (req, res) => {
    const { type, user } = req.body; // 'like' | 'dislike' | 'neutral', and user name

    try {
        const message = await Message.findById(req.params.id);
        if (!message) return res.status(404).json({ error: 'Message not found' });

        const prevReaction = message.reactions.get(user); // Get previous reaction

        if (type === 'neutral') {
            if (prevReaction === 'like') message.likes -= 1;
            if (prevReaction === 'dislike') message.dislikes -= 1;
            message.reactions.delete(user);
        } else if (type !== prevReaction) {
            if (prevReaction === 'like') message.likes -= 1;
            if (prevReaction === 'dislike') message.dislikes -= 1;

            if (type === 'like') message.likes += 1;
            if (type === 'dislike') message.dislikes += 1;

            message.reactions.set(user, type);
        }

        const updated = await message.save();
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Reaction update failed' });
    }
};


const projectOverview = async (req,res)=>{
    try {
        const totalProjects = await Project.countDocuments();
        const ongoingProjects = await Project.countDocuments({ status: "ongoing" });
        const completedProjects = await Project.countDocuments({ status: "completed" });

        const totalOfficers = await Officer.countDocuments();
        const departments = await User.find();

        const departmentWorkload = await Promise.all(
            departments.map(async (dept) => {
                const count = await Project.countDocuments({ department: dept._id });
                return { name: dept.name, count };
            })
        );

        res.json({success:true,
            totalProjects,
            ongoingProjects,
            completedProjects,
            totalOfficers,
            departmentWorkload,
        });
    } catch (err) {
        res.json({success:false, message: err.message });
    }
}



const viewPendingProjects = async(req,res)=>{
    try {
        const pendingProjects = await Project.find({ status: "pending" });
        res.json({ success: true, projects: pendingProjects });
        
      } catch (error) {
        res.json({ success: false, message: error.message });
      }
}

const approveProject = async (req, res) => {
    try {

      const { projectId, action } = req.body; // action = 'approve' or 'reject'
      const project = await Project.findById(projectId);
  
      if (!project) {
        return res.status(404).json({ success: false, message: "Project not found" });
      }
  
      project.status = action === "approve" ? "approved" : "rejected";
      await project.save();
  
      res.json({ success: true, message: `Project ${action}d successfully` });
      
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  const getTasks = async(req,res)=>{
    try {
        const tasks = await Task.find({ projectId: req.params.projectId });
        res.json(tasks);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
  }
  
  const createTask = async(req,res)=>{
    const { title, description, startDate, endDate, assignedTo,projectId,createdBy } = req.body;
    
    try {
        const task = new Task({
            title,
            description,
            startDate,
            endDate,
            status: 'Pending',
            createdBy,
            projectId,
            assignedTo, // Assigning the officer's ID
        });

        await task.save();
        res.json({success:true,task})
    } catch (error) {
        console.error(error);
        res.json({success:false, error: 'Failed to create task' });
    }
  }

  const updateTask = async(req,res)=>{
    try {
        const { status } = req.body;
        const { taskId } = req.params;

        const validStatuses = ["Pending", "In Progress", "Completed"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: "Invalid status value" });
        }

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }

        task.status = status;
        await task.save();

        res.json({ message: "Task status updated successfully", task });
    } catch (error) {
        console.error("Error updating task status:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
  }

  const deleteTask = async(req,res)=>{
    try {
        await Task.findByIdAndDelete(req.params.taskId);
        res.json({ message: "Task deleted" });
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
  }


  const fetchOfficers = async(req,res)=>{
    try {
        const { department } = req.body; // Extract departmentId from the request body

        
        // Fetch all officers of the given department
        const officers = await Officer.find({ department });

        // Return the officers
        res.json({success:true,officers});
    } catch (error) {
        console.error('Error fetching officers:', error);
        res.status(500).json({ success:false,message: 'Server error' });
    }
  }



//   const isCompleted=async(req,res)=>{
//     try{
//         const project= ;
//     }catch{

//     }
//   }

export { departmentHeadSignup, departmentHeadLogin, addProject, viewProject, addOfficer, getProjectDetails, getCollaborationRequests, changeCollaborationRequestStatus, getCollaborationRequestsByDepartment, addMessage, updateLikes,projectOverview,viewPendingProjects,approveProject,createTask,updateTask,deleteTask,getTasks,fetchOfficers }; 