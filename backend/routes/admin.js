import express from 'express';
import { getPendingRequests, updateStatus,getDashboardStats,authenticateAdmin,deleteAllUsers } from '../controllers/adminController.js';
import adminAuth from '../middlewares/adminAuth.js';
const adminRouter = express.Router();

adminRouter.get("/pending-requests",adminAuth, getPendingRequests);
adminRouter.post("/update-status", adminAuth,updateStatus);
adminRouter.get("/dashboard-stats", adminAuth,getDashboardStats);
adminRouter.post("/admin-login",authenticateAdmin)
adminRouter.delete('/deleteUsers',adminAuth,deleteAllUsers)
export default adminRouter;
