import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

interface AuthRequest extends Request {
  user?: {
    id: number;
  };
}

router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  if (req.user) {
    res.json({ userId: req.user.id });
  } else {
    // This case should ideally not be reached if authMiddleware is working correctly
    res.status(401).json({ message: 'User not authenticated' });
  }
});

export default router;
