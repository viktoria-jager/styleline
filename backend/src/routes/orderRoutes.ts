import express from "express";
import { createOrder } from "../controllers/orderControllers";

const router = express.Router();

router.post("/", createOrder);

export default router;