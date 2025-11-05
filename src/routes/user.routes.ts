import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/me", authMiddleware, (req, res) => {
  // req.user existe graças ao middleware
  res.json({ user: req.user });
});

export default router;
