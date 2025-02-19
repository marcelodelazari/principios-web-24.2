import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateJWT = (
  req: Request & { userId?: number },
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, decoded: any) => {
      if (err) {
        res.status(403).json({ message: 'Token inválido' });
        return;
      }
      req.userId = decoded.userId;
      next();
    });
  } else {
    res.status(401).json({ message: 'Token não fornecido' });
  }
};
