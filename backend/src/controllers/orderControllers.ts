import { Request, Response } from "express";
import { db } from "../db/db";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let totalPrice = 0;

    // 1. total számítás products táblából
    for (const item of items) {
      const result = await db.query(
        "SELECT price FROM products WHERE id = $1",
        [item.productId]
      );

      const product = result.rows[0];
      if (!product) continue;

      totalPrice += product.price * item.quantity;
    }

    // 2. order létrehozás
    const orderResult = await db.query(
      "INSERT INTO orders (total_price) VALUES ($1) RETURNING id",
      [totalPrice]
    );

    const orderId = orderResult.rows[0].id;

    // 3. order_items mentés
    for (const item of items) {
      const result = await db.query(
        "SELECT price FROM products WHERE id = $1",
        [item.productId]
      );

      const product = result.rows[0];
      if (!product) continue;

      await db.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
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