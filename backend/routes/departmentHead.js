import express from 'express';
import { departmentHeadSignup } from '../controllers/departmentHeadController.js';
import { departmentHeadLogin } from '../controllers/departmentHeadController.js';
import { addOfficer } from '../controllers/departmentHeadController.js';
import {addProject} from '../controllers/departmentHeadController.js'
import {viewProject} from '../controllers/departmentHeadController.js'
import departmentHeadAuth from '../middlewares/departmentHeadAuth.js'
const departmentHeadRouter = express.Router();
departmentHeadRouter.post('/signup', departmentHeadSignup);
departmentHeadRouter.post('/login',departmentHeadLogin);

departmentHeadRouter.post('/addproject',departmentHeadAuth,addProject)

departmentHeadRouter.get('/viewprojects',departmentHeadAuth,viewProject)

departmentHeadRouter.post('/addOfficer',departmentHeadAuth,addOfficer);
export default departmentHeadRouter;
