import mongoose from 'mongoose';
const { Schema } = mongoose;

const productSchema = new Schema({
  name: {type:String, required:true},
  category: {type:String, required:true},
  subcategory: {type:String, required:true},
  price: {type:Number, required:true},
  rank: {type:Number, required:true},
  review: {type:String, required:true},
},{ versionKey: false })

export const Product = mongoose.model('products', productSchema);