import express from "express";
import { body, header, param, query } from "express-validator";
import { Product } from "../models/schema";
import { checkErrors } from "./utils";

const router = express.Router();

//1)GET for all products(6)
/* router.get("/", async (_, res) => {
  res.json(await Product.find());
}); */

//2)GET for id
router.get("/:id", param("id").isMongoId(), checkErrors, async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ message: "product not found" });
  }
  res.json(product);
});

//3)GET all products in a given category
router.get(
  "/categories/:category",
  param("category").isString().notEmpty(),
  checkErrors,
  async (req, res) => {
    const { category } = req.params;
    try {
      const product = await Product.find({ category: category });
      if (!product || product.length === 0) {
        return res.status(404).json({ message: "category does not exist" });
      }
      return res.json(product);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

//4)DELETE
router.delete(
  "/:id",
  param("id").isMongoId(),
  checkErrors,
  async (req, res) => {
    const { id } = req.params;
    const productDeleted = await Product.findByIdAndDelete(id);
    productDeleted
      ? res.status(200).json({ message: "product delete", productDeleted })
      : res.status(404).json({ message: "product not found" });
  }
);

//5)POST to insert product
router.post(
  "/",
  body("name").exists().isString(),
  body("category").exists().isString(),
  body("subcategory").exists().isString(),
  body("price").exists().isNumeric(),
  body("rank").exists().isNumeric(),
  body("review").exists().isString(),
  checkErrors,
  async (req, res) => {
    const { name, category, subcategory, price, rank, review } = req.body;
    const product = new Product({
      name,
      category,
      subcategory,
      price,
      rank,
      review,
    });
    //Adds document to collection
    const productSaved = await product.save();
    res.status(201).json(productSaved);
  }
);

//1)/6)GET for all products and for price, rank, category and subcategory
router.get(
  "/",
  query("price").optional().isNumeric(),
  query("rank").optional().isNumeric(),
  query("category").optional().isString(),
  query("subcategory").optional().isString(),
  checkErrors,
  async (req, res) => {
    const productsQuery = await Product.find({ ...req.query });
    if (!productsQuery) {
      return res.json(Product.find());
    }
    return res.json(productsQuery);
  }
);

export default router;
