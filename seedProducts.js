
require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const products = [
  {
    name: "iPhone 18 Pro",
    brand: "Apple",
    price: 164900,
    category: "smartphones",
    rating: 4.9,
    reviews: 245,
    image: "/products/iphone%2018%20pro.jpg",
    stock: 10,
  },
  {
    name: "MacBook Pro",
    brand: "Apple",
    price: 210000,
    category: "laptops",
    rating: 4.8,
    reviews: 184,
    image: "/products/MacBook%20Pro.jpg",
    stock: 10,
  },
  {
    name: "Dell Laptop",
    brand: "Dell",
    price: 64900,
    category: "laptops",
    rating: 4.7,
    reviews: 126,
    image: "/products/Dell%20laptop.jpg",
    stock: 10,
  },
  {
    name: "HP Laptop",
    brand: "HP",
    price: 72000,
    category: "laptops",
    rating: 4.6,
    reviews: 103,
    image: "/products/Hp%20laptop.jpg",
    stock: 10,
  },
  {
    name: "iPhone 17",
    brand: "Apple",
    price: 80000,
    category: "smartphones",
    rating: 4.8,
    reviews: 318,
    image: "/products/iPhone%2017.jpg",
    stock: 10,
  },
  {
    name: "Samsung Galaxy S26 Ultra",
    brand: "Samsung",
    price: 124900,
    category: "smartphones",
    rating: 4.9,
    reviews: 412,
    image: "/products/Samsung%20S26%20ultra.jpg",
    stock: 10,
  },
  {
    name: "ROG Gaming Laptop",
    brand: "ASUS ROG",
    price: 94900,
    category: "laptops",
    rating: 4.8,
    reviews: 157,
    image: "/products/rog%20laptop.jpg",
    stock: 10,
  },
  {
    name: "Samsung Galaxy S25 FE",
    brand: "Samsung",
    price: 54900,
    category: "smartphones",
    rating: 4.6,
    reviews: 198,
    image: "/products/Samsung%20S25%20FE.jpg",
    stock: 10,
  },
  {
    name: "Samsung Galaxy S26",
    brand: "Samsung",
    price: 84900,
    category: "smartphones",
    rating: 4.7,
    reviews: 276,
    image: "/products/Samsung%20S26.jpg",
    stock: 10,
  },
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Product.deleteMany({ name: "Test Product" });
    await Product.insertMany(products);

    console.log("Success! All 9 original products added.");
    console.log("The Test Product has been removed.");
  } catch (error) {
    console.error("Seeding failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedProducts();
