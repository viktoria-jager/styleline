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

export const createProduct = async (req: Request, res: Response) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const { name, priceEUR, description } = req.body;
    const image = req.file?.filename;

    console.log("INSERTING...");

    const result = await db.query(
      "INSERT INTO products (name, priceEUR, description, image) VALUES (?, ?, ?, ?)",
      [name, priceEUR, description, image]
    );

    console.log("DB RESULT:", result);

    return res.json({ message: "Product saved to database" });

  } catch (err) {
    console.error("DB ERROR:", err);
    return res.status(500).json({ message: "Database insert failed" });
  }
};