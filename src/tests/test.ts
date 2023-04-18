import request from "supertest";
require("chai").should();
import { app } from "../app";
import { Product } from "../models/schema";

const basicUrl = "/v1/products";

describe("products", () => {
  const product = {
    name: "Xiaomi",
    category: "electronics",
    subcategory: "phone",
    price: 200,
    rank: 4,
    review: "nice",
  };
  after(async () => {
    await Product.findOneAndDelete({ name: product.name });
  });

  //1)
  describe("get products", () => {
    let ids: string[] = [];
    const products = [
      {
        name: "Samsung",
        category: "electronics",
        subcategory: "phone",
        price: 400,
        rank: 4,
        review: "fantastic",
      },
      {
        name: "Iphone",
        category: "electronics",
        subcategory: "phone",
        price: 1000,
        rank: 4.5,
        review: "fantastic",
      },
      {
        name: "Lenovo",
        category: "informatics",
        subcategory: "pc",
        price: 500,
        rank: 4.5,
        review: "beautiful",
      },
    ];
    before(async () => {
      const response = await Promise.all([
        Product.create(products[0]),
        Product.create(products[1]),
        Product.create(products[2]),
      ]);
      ids = response.map((item) => item._id.toString());
    });
    after(async () => {
      await Promise.all([
        Product.findByIdAndDelete(ids[0]),
        Product.findByIdAndDelete(ids[1]),
        Product.findByIdAndDelete(ids[2]),
      ]);
    });

    it("test success 200", async () => {
      const { status, body } = await request(app).get(basicUrl);
      status.should.be.equal(200);
      body.should.have.property("length").equal(products.length);
    });

    it("test success 200 with query params", async () => {
      const { status, body } = await request(app).get(
        `${basicUrl}?subcategory=pc`
      );
      status.should.be.equal(200);
      body.should.have.property("length").equal(1);
    });
  });

  //2)
  describe("get product by id", () => {
    let id: string;
    before(async () => {
      const p = await Product.create(product);
      id = p._id.toString();
    });
    after(async () => {
      await Product.findByIdAndDelete(id);
    });
    it("test success 200", async () => {
      const { status, body } = await request(app).get(`${basicUrl}/${id}`);
      status.should.be.equal(200);
      body.should.have.property("_id");
      body.should.have.property("name").equal(product.name);
      body.should.have.property("category").equal(product.category);
      body.should.have.property("subcategory").equal(product.subcategory);
      body.should.have.property("price").equal(product.price);
      body.should.have.property("rank").equal(product.rank);
      body.should.have.property("review").equal(product.review);
    });
    it("test unsuccess 404 not valid mongoId", async () => {
      const fakeId = "a" + id.substring(1);
      const { status } = await request(app).get(`${basicUrl}/${fakeId}`);
      status.should.be.equal(404);
    });
  });

  //3)
  describe("get product by categories", () => {
    let category: string;
    before(async () => {
      const p = await Product.create(product);
      category = p.category;
    });
    after(async () => {
      await Product.findOneAndDelete({ category: category });
    });
    it("test success 200", async () => {
      const { status, body } = await request(app).get(
        `${basicUrl}/categories/${category}`
      );
      status.should.be.equal(200);
      body.should.be.an("array").that.is.not.empty;
      const product = body[0];
      product.should.have.property("_id");
      product.should.have.property("name").equal(product.name);
      product.should.have.property("category").equal(category);
      product.should.have.property("subcategory").equal(product.subcategory);
      product.should.have.property("price").equal(product.price);
      product.should.have.property("rank").equal(product.rank);
      product.should.have.property("review").equal(product.review);
    });
    it("test unsuccess 404 category does not exist", async () => {
      const fakeCategory = "a" + category.substring(1);
      const { body, status } = await request(app).get(
        `${basicUrl}/categories/${fakeCategory}`
      );
      status.should.be.equal(404);
      body.should.have.property("message").equal("category does not exist");
    });
  });

  //4)
  describe("create product", () => {
    let id: string;
    after(async () => {
      await Product.findByIdAndDelete(id);
    });
    it("test 400 missing name", async () => {
      const fakeProduct = { ...product } as any;
      delete fakeProduct.name;
      const { status } = await request(app)
        .post(`${basicUrl}`)
        .send(fakeProduct);
      status.should.be.equal(400);
    });
    it("test 400 missing category", async () => {
      const fakeProduct = { ...product } as any;
      delete fakeProduct.category;
      const { status } = await request(app)
        .post(`${basicUrl}`)
        .send(fakeProduct);
      status.should.be.equal(400);
    });
    it("test 400 missing subcategory", async () => {
      const fakeProduct = { ...product } as any;
      delete fakeProduct.subcategory;
      const { status } = await request(app)
        .post(`${basicUrl}`)
        .send(fakeProduct);
      status.should.be.equal(400);
    });
    it("test 400 price not number", async () => {
      const fakeProduct = { ...product } as any;
      fakeProduct.price = "pippo";
      const { status } = await request(app)
        .post(`${basicUrl}`)
        .send({ fakeProduct });
      status.should.be.equal(400);
    });
    it("test 400 rank not number", async () => {
      const fakeProduct = { ...product } as any;
      fakeProduct.rank = "pippo";
      const { status } = await request(app)
        .post(`${basicUrl}`)
        .send({ fakeProduct });
      status.should.be.equal(400);
    });
    it("test 400 missing review", async () => {
      const fakeProduct = { ...product } as any;
      delete fakeProduct.review;
      const { status } = await request(app)
        .post(`${basicUrl}`)
        .send(fakeProduct);
      status.should.be.equal(400);
    });

    it("test 201 for insert product", async () => {
      const { body, status } = await request(app).post(basicUrl).send(product);
      status.should.be.equal(201);
      body.should.have.property("_id");
      body.should.have.property("name").equal(product.name);
      body.should.have.property("category").equal(product.category);
      body.should.have.property("subcategory").equal(product.subcategory);
      body.should.have.property("price").equal(product.price);
      body.should.have.property("rank").equal(product.rank);
      body.should.have.property("review").equal(product.review);
      id = body._id;
    });
  });

  //5)
  describe("Delete products", () => {
    let id: string;
    before(async () => {
      const p = await Product.create(product);
      id = p._id.toString();
    });
    it("test success 200", async () => {
      const { status } = await request(app).delete(`${basicUrl}/${id}`);
      status.should.be.equal(200);
    });
    it("test failed 404", async () => {
      const { status } = await request(app).delete(`${basicUrl}/${id}`);
      status.should.be.equal(404);
    });
  });
});
