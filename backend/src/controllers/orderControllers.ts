import { Request, Response } from "express";
import { db } from "../db/db";

export const getOrders = async (req: Request, res: Response) => {
  try {
    const [orders]: any = await db.query(`
      SELECT * FROM orders ORDER BY id DESC
    `);

    for (const order of orders) {
      const [items]: any = await db.query(`
        SELECT 
          oi.quantity,
          p.name
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);

      order.items = items;
    }

    res.json(orders);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching orders" });
  }
};


export const createOrder = async (req: Request, res: Response) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let totalPrice = 0;

    for (const item of items) {
      const [rows]: any = await db.query(
        "SELECT priceEUR FROM products WHERE id = ?",
        [item.productId]
      );

      const product = rows[0];
      if (!product) continue;

      totalPrice += product.priceEUR * item.quantity;
    }

    const [result]: any = await db.query(
      "INSERT INTO orders (total_price) VALUES (?)",
      [totalPrice]
    );

    const orderId = result.insertId;

    for (const item of items) {
      const [rows]: any = await db.query(
        "SELECT priceEUR FROM products WHERE id = ?",
        [item.productId]
      );

      const product = rows[0];
      if (!product) continue;

      await db.query(
        `INSERT INTO order_items (order_id, product_id, quantity, priceEUR)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.productId, item.quantity, product.priceEUR]
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