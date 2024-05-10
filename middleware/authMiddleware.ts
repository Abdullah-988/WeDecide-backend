import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import sql from "../lib/db";

interface JwtPayload {
  id: string;
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.body.token;
  if (token) {
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

      // Get user from the token
      const user = await sql`SELECT * FROM users WHERE id = ${parseInt(decoded.id)}`;

      if (!user.length) {
        return res.status(401).send("Unauthorized");
      }

      // @ts-ignore
      req.user = user[0];

      next();
    } catch (error: any) {
      console.log(error.message);
      return res.status(401).send("Unauthorized");
    }
  } else {
    return res.status(401).send("Unauthorized");
  }
};
