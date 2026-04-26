import { Request, Response } from "express";
import { db } from "../db/db";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query("SELECT * FROM products");
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};