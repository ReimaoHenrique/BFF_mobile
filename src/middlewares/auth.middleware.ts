import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient().$extends(withAccelerate());

const JWT_SECRET = process.env["JWT_SECRET"];

export interface JwtPayloadSimple {
  id?: string | number;
  role?: string;
  iat?: number;
  exp?: number;
  [k: string]: any;
}

// adiciona tipagem de req.user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: "Authorization header missing" });

    const parts = authHeader.split(" ");
    const token = parts.length === 2 ? parts[1] : parts[0];
    if (!token) return res.status(401).json({ error: "Token not provided" });

    // valida token
    let payload: JwtPayloadSimple;
    try {
      if (!JWT_SECRET) {
        console.error("JWT_SECRET is not configured");
        return res.status(500).json({ error: "Server configuration error" });
      }
      payload = jwt.verify(token, JWT_SECRET) as JwtPayloadSimple;
    } catch (err) {
      console.error("JWT verification failed:", err);
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const idRaw = payload.id ?? payload["sub"];
    if (!idRaw)
      return res.status(400).json({ error: "Token payload missing id" });

    const id = Number(idRaw);
    if (!Number.isFinite(id) || id <= 0)
      return res.status(400).json({ error: "Invalid id in token" });

    // busca user
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyId: true,
        picture: true,
        status: true,
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    // busca company opcional
    const company = user.companyId
      ? await prisma.company.findUnique({
          where: { id: user.companyId },
          select: { id: true, publicId: true, name: true },
        })
      : null;

    req.user = { ...user, company };
    next();
  } catch (error) {
    console.error("authMiddleware error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
