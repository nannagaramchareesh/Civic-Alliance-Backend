import express from 'express';
import { departmentHeadSignup } from '../controllers/departmentHeadController.js';
import { departmentHeadLogin } from '../controllers/departmentHeadController.js';
import { addOfficer } from '../controllers/departmentHeadController.js';
import {addProject} from '../controllers/departmentHeadController.js'
import {viewProject} from '../controllers/departmentHeadController.js'
import departmentHeadAuth from '../middlewares/departmentHeadAuth.js'
import { getProjectDetails } from '../controllers/departmentHeadController.js';
import { getCollaborationRequests } from '../controllers/departmentHeadController.js';
import { changeCollaborationRequestStatus } from '../controllers/departmentHeadController.js';
import { getCollaborationRequestsByDepartment } from '../controllers/departmentHeadController.js';
import { addMessage } from '../controllers/departmentHeadController.js';
import { updateLikes } from '../controllers/departmentHeadController.js';
import { projectOverview } from '../controllers/departmentHeadController.js';
import { viewPendingProjects } from '../controllers/departmentHeadController.js';
import { approveProject } from '../controllers/departmentHeadController.js';
const departmentHeadRouter = express.Router();
departmentHeadRouter.post('/signup', departmentHeadSignup);

departmentHeadRouter.post('/login',departmentHeadLogin);

departmentHeadRouter.post('/addproject',addProject)

departmentHeadRouter.get('/viewprojects',viewProject)

departmentHeadRouter.post('/addOfficer',addOfficer);

departmentHeadRouter.get('/projects/:id',getProjectDetails);

departmentHeadRouter.post('/collaborationRequests',getCollaborationRequests);

departmentHeadRouter.put('/projects/:projectId/collaboration',changeCollaborationRequestStatus);

departmentHeadRouter.post('/sentCollaborationRequests',getCollaborationRequestsByDepartment);

departmentHeadRouter.patch('/:id/reaction',updateLikes);

departmentHeadRouter.get('/addMessage',addMessage);

departmentHeadRouter.get('/overview',projectOverview);

departmentHeadRouter.get('/viewpendingprojects',viewPendingProjects);

departmentHeadRouter.patch('/approve',approveProject);
export default departmentHeadRouter;
