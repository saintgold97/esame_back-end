import express, { Request, Response, NextFunction } from "express";
export const app = express();
import products from "./routes/product";
import mongoose from "mongoose";

app.use(express.json());
app.use("/v1/products", products);

//SERVER
app.listen(process.env.PORT || 3001, async () => {
  console.log("Server is running");
  await
    mongoose.connect(`mongodb://127.0.0.1:27017/${process.env.DB}`)
      .then(() => {
        console.log('| Connection to MongoDB | HOST: localhost:27017');
      })
      .catch((error) => {
        console.log(
          '| An error occurred while connecting to MongoDB: ',
          error
        );
      });
});

export default app;
