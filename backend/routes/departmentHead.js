import express from 'express';
import { departmentHeadSignup } from '../controllers/departmentHeadController.js';

const departmentHeadRouter = express.Router();
departmentHeadRouter.post('/signup', departmentHeadSignup);

export default departmentHeadRouter;
