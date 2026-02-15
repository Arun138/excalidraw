import { JWT_SECRET } from "@repo/backend-common/config";
import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken'

export const authMiddleware = (req:Request,res:Response,next:NextFunction) => {
    const token = req.headers["authorization"]
    if (!token) {
        return res.status(403).json({message:"Token isn't provided !"})
    }
    try {
        const decoded = jwt.verify(token,JWT_SECRET)
        if (typeof decoded === 'string') {
            return res.status(403).json({message:"You are not logged in !"})
        }
        req.userId = decoded.id 
        next()
    } catch (error) {
        return res.status(500).json({message:"Server error | "+error})
        
    }
}