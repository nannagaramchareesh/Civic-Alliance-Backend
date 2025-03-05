import express from 'express';
import cors from 'cors';
import connectDB from './config/mongodb.js';
import departmentHeadRouter from './routes/departmentHead.js';
import adminRouter from './routes/admin.js';
import 'dotenv/config';

// App Configuration
const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/admin', adminRouter);
app.use('/api/departmentHead', departmentHeadRouter);

app.listen(port, () => {
    console.log("Listening on port", port);
});
