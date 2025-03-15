import express from 'express';
import { getPendingRequests, updateStatus,getDashboardStats,authenticateAdmin,deleteAllUsers,getApprovedUsers, changeStatus } from '../controllers/adminController.js';
import adminAuth from '../middlewares/adminAuth.js';
const adminRouter = express.Router();

adminRouter.get("/pending-requests",adminAuth, getPendingRequests);
adminRouter.post("/update-status", adminAuth,updateStatus);
adminRouter.get("/dashboard-stats", adminAuth,getDashboardStats);
adminRouter.post("/admin-login",authenticateAdmin)
adminRouter.delete('/deleteUsers',adminAuth,deleteAllUsers)
adminRouter.get('/getallusers',getApprovedUsers);
adminRouter.post('/changeStatus',changeStatus);
export default adminRouter;
