import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { clerkMiddleware, requireAuth } from '@clerk/express'
import authRoutes from './routes/authRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import guestRoutes from './routes/guestRoutes.js'
import studentRoutes from './routes/studentRoutes.js'
import courseRoutes from './routes/courseRoutes.js'
import statsRoutes from './routes/statsRoutes.js'
import facultyRoutes from './routes/facultyRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import { updateLastActive } from './middlewares/updateLastActiveMiddleware.js'

const app = express();

dotenv.config();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors(
    {
        origin: [
            'http://localhost:5173',
            'http://192.168.254.180:5173',
        ],
        credentials: true
    }
));
app.use(clerkMiddleware()); 


app.use('/api/upload', requireAuth(), uploadRoutes);
app.use('/api/admin', requireAuth(), updateLastActive, adminRoutes);
app.use('/api/student', requireAuth(), updateLastActive, studentRoutes);
app.use('/api/faculty', requireAuth(), updateLastActive, facultyRoutes);
app.use('/api/course', requireAuth(), courseRoutes);
app.use('/api/stats', requireAuth(), statsRoutes);
app.use('/api/auth',requireAuth(), updateLastActive, authRoutes);
app.use('/api', guestRoutes);

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running in PORT ${PORT}`);
})

