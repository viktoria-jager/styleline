import express from "express";
import { getProducts } from "../controllers/productController";
import { createProduct } from "../controllers/productController";
import multer from "multer"; 
import { db } from "../db/db";


const router = express.Router();

router.get("/", getProducts);

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });


router.post("/", upload.single("image"), createProduct);

router.put("/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { name, priceEUR, description } = req.body;
  const newImage = req.file?.filename;

  try {
    
    if (newImage) {
      await db.query(
        "UPDATE products SET name=?, priceEUR=?, description=?, image=? WHERE id=?",
        [name, priceEUR, description, newImage, id]
      );
    } else {
      await db.query(
        "UPDATE products SET name=?, priceEUR=?, description=? WHERE id=?",
        [name, priceEUR, description, id]
      );
    }

    res.json({ message: "Product updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
});




export default router;