import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import meRoutes from './routes/me';
import profileRoutes from './routes/profile';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/', meRoutes);
app.use('/', profileRoutes);



export default app;
