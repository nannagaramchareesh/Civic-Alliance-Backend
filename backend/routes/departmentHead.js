import express from 'express';
import { departmentHeadSignup } from '../controllers/departmentHeadController.js';
import { departmentHeadLogin } from '../controllers/departmentHeadController.js';
const departmentHeadRouter = express.Router();
departmentHeadRouter.post('/signup', departmentHeadSignup);
departmentHeadRouter.post('/login',departmentHeadLogin);
export default departmentHeadRouter;
