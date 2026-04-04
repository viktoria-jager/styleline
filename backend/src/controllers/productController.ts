import { Request, Response } from "express";
import { db } from "../db/db";

export const getProducts = (req: Request, res: Response) => {
    db.query("SELECT * FROM products", (err: any, results: any) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "DB error" });
        }

        res.json(results);
    });
};