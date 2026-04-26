import { Request, Response } from "express";
import { db } from "../db/db";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let totalPrice = 0;

    for (const item of items) {
      const [rows]: any = await db.query(
        "SELECT price FROM products WHERE id = ?",
        [item.productId]
      );

      const product = rows[0];
      if (!product) continue;

      totalPrice += product.price * item.quantity;
    }

    const [result]: any = await db.query(
      "INSERT INTO orders (total_price) VALUES (?)",
      [totalPrice]
    );

    const orderId = result.insertId;

    for (const item of items) {
      const [rows]: any = await db.query(
        "SELECT price FROM products WHERE id = ?",
        [item.productId]
      );

      const product = rows[0];
      if (!product) continue;

      await db.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.productId, item.quantity, product.price]
      );
    }

    return res.status(201).json({
      message: "Order created",
      orderId,
      totalPrice
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};