
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Product = require("./models/Product");
const User = require("./models/User");
const Order = require("./models/Order");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// -------------------- HELPERS --------------------

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
  };
}

function createToken(user) {
  return jwt.sign(
    { userId: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
}

// -------------------- AUTH MIDDLEWARE --------------------

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        success: false,
        message: "Please log in to continue.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select(
      "name email mobile role"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Account not found. Please log in again.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired login token. Please log in again.",
    });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required.",
    });
  }

  next();
}

// -------------------- HOME / HEALTH --------------------

app.get("/", (req, res) => {
  res.status(200).send("AURAMART Backend is running!");
});

app.get("/api/health", (req, res) => {
  const connected = mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    success: connected,
    message: "AURAMART API is running",
    database: connected ? "Connected" : "Disconnected",
  });
});

// -------------------- SIGNUP --------------------

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body || {};

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    if (password.length > 72) {
      return res.status(400).json({
        success: false,
        message: "Password is too long.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      mobile: typeof mobile === "string" ? mobile.trim() : "",
      password: hashedPassword,
      role: "user",
    });

    const token = createToken(user);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    console.error("Signup error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Signup failed. Please try again.",
    });
  }
});

// -------------------- LOGIN --------------------

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = createToken(user);

    return res.json({
      success: true,
      message: "Login successful.",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
});

// -------------------- CURRENT USER --------------------

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({
    success: true,
    user: publicUser(req.user),
  });
});

// -------------------- PRODUCT VALIDATION --------------------

function validateProduct(body, partial = false) {
  if (
    !partial &&
    (typeof body.name !== "string" || !body.name.trim())
  ) {
    return "Product name is required";
  }

  if (
    body.name !== undefined &&
    (typeof body.name !== "string" || !body.name.trim())
  ) {
    return "Product name must not be empty";
  }

  if (
    !partial &&
    (body.price === undefined ||
      body.price === null ||
      body.price === "")
  ) {
    return "Product price is required";
  }

  if (
    body.price !== undefined &&
    (!Number.isFinite(Number(body.price)) ||
      Number(body.price) < 0)
  ) {
    return "Price must be a valid non-negative number";
  }

  if (
    body.stock !== undefined &&
    (!Number.isInteger(Number(body.stock)) ||
      Number(body.stock) < 0)
  ) {
    return "Stock must be a non-negative whole number";
  }

  if (
    body.rating !== undefined &&
    (!Number.isFinite(Number(body.rating)) ||
      Number(body.rating) < 0 ||
      Number(body.rating) > 5)
  ) {
    return "Rating must be between 0 and 5";
  }

  if (
    body.reviews !== undefined &&
    (!Number.isInteger(Number(body.reviews)) ||
      Number(body.reviews) < 0)
  ) {
    return "Reviews must be a non-negative whole number";
  }

  return null;
}

function getProductFields(body) {
  const fields = [
    "name",
    "brand",
    "description",
    "price",
    "image",
    "category",
    "stock",
    "rating",
    "reviews",
  ];

  const data = {};

  for (const field of fields) {
    if (body[field] !== undefined) {
      data[field] = [
        "price",
        "stock",
        "rating",
        "reviews",
      ].includes(field)
        ? Number(body[field])
        : body[field];
    }
  }

  if (data.name !== undefined) {
    data.name = data.name.trim();
  }

  return data;
}

// -------------------- GET ALL PRODUCTS --------------------

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Fetch products:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
});

// -------------------- GET ONE PRODUCT --------------------

app.get("/api/products/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.json({ success: true, product });
  } catch (error) {
    console.error("Fetch product:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
});

// -------------------- ADD PRODUCT: ADMIN ONLY --------------------

app.post(
  "/api/products",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const validationError = validateProduct(req.body || {});

      if (validationError) {
        return res.status(400).json({
          success: false,
          message: validationError,
        });
      }

      const product = await Product.create(
        getProductFields(req.body)
      );

      return res.status(201).json({
        success: true,
        message: "Product added successfully",
        product,
      });
    } catch (error) {
      console.error("Add product:", error.message);

      return res.status(500).json({
        success: false,
        message: "Failed to add product",
      });
    }
  }
);

// -------------------- UPDATE PRODUCT: ADMIN ONLY --------------------

app.put(
  "/api/products/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID",
        });
      }

      const validationError = validateProduct(req.body || {}, true);

      if (validationError) {
        return res.status(400).json({
          success: false,
          message: validationError,
        });
      }

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: getProductFields(req.body) },
        { new: true, runValidators: true }
      );

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      return res.json({
        success: true,
        message: "Product updated successfully",
        product,
      });
    } catch (error) {
      console.error("Update product:", error.message);

      return res.status(500).json({
        success: false,
        message: "Failed to update product",
      });
    }
  }
);

// -------------------- DELETE PRODUCT: ADMIN ONLY --------------------

app.delete(
  "/api/products/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID",
        });
      }

      const product = await Product.findByIdAndDelete(req.params.id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      return res.json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      console.error("Delete product:", error.message);

      return res.status(500).json({
        success: false,
        message: "Failed to delete product",
      });
    }
  }
);

// -------------------- CREATE ORDER --------------------

app.post("/api/orders", requireAuth, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty.",
      });
    }

    if (!shippingAddress || typeof shippingAddress !== "object") {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required.",
      });
    }

    const address = {
      fullName: shippingAddress.fullName || shippingAddress.name,
      phone: shippingAddress.phone || shippingAddress.mobile,
      address:
        shippingAddress.address ||
        shippingAddress.street ||
        shippingAddress.addressLine,
      city: shippingAddress.city,
      state: shippingAddress.state,
      pincode:
        shippingAddress.pincode ||
        shippingAddress.pinCode ||
        shippingAddress.zip,
    };

    for (const [field, value] of Object.entries(address)) {
      if (typeof value !== "string" || !value.trim()) {
        return res.status(400).json({
          success: false,
          message: `Please provide a valid shipping ${field}.`,
        });
      }

      address[field] = value.trim();
    }

    const normalizedPayment = String(paymentMethod || "COD")
      .trim()
      .toUpperCase();

    if (!["COD", "ONLINE"].includes(normalizedPayment)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method.",
      });
    }

    const requestedItems = items.map((item) => ({
      productId:
        item.productId ||
        item._id ||
        item.id ||
        item.product?._id ||
        item.product?.id,
      quantity: Number(item.quantity ?? item.qty),
    }));

    for (const item of requestedItems) {
      if (
        !mongoose.isValidObjectId(item.productId) ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "A cart item has an invalid product ID or quantity.",
        });
      }
    }

    const productIds = [
      ...new Set(requestedItems.map((item) => String(item.productId))),
    ];

    const products = await Product.find({
      _id: { $in: productIds },
    });

    const productMap = new Map(
      products.map((product) => [String(product._id), product])
    );

    const orderItems = [];

    for (const item of requestedItems) {
      const product = productMap.get(String(item.productId));

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "A product in your cart no longer exists.",
        });
      }

      if (
        !Number.isFinite(Number(product.price)) ||
        Number(product.price) < 0
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid price for ${product.name}.`,
        });
      }

      if (
        product.stock !== undefined &&
        Number(product.stock) < item.quantity
      ) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}.`,
        });
      }

      orderItems.push({
        productId: product._id,
        name: product.name,
        image: product.image || "",
        price: Number(product.price),
        quantity: item.quantity,
      });
    }

    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const shippingCharge = 0;
    const totalAmount = subtotal + shippingCharge;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress: address,
      paymentMethod: normalizedPayment,
      paymentStatus: "Pending",
      orderStatus: "Placed",
      subtotal,
      shippingCharge,
      totalAmount,
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to place order. Please try again.",
    });
  }
});

// -------------------- CUSTOMER: MY ORDERS --------------------

app.get("/api/orders/my-orders", requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Fetch customer orders error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your orders.",
    });
  }
});

// -------------------- ADMIN: ALL ORDERS --------------------

app.get(
  "/api/orders",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const orders = await Order.find()
        .populate("user", "name email mobile")
        .sort({ createdAt: -1 });

      return res.json({
        success: true,
        count: orders.length,
        orders,
      });
    } catch (error) {
      console.error("Fetch all orders error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch orders.",
      });
    }
  }
);

// -------------------- UPDATE ORDER STATUS: ADMIN ONLY --------------------

app.patch(
  "/api/orders/:id/status",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order ID.",
        });
      }

      const allowedStatuses = [
        "Placed",
        "Confirmed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ];

      const { orderStatus } = req.body || {};

      if (!allowedStatuses.includes(orderStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order status.",
        });
      }

      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { $set: { orderStatus } },
        { new: true, runValidators: true }
      ).populate("user", "name email mobile");

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found.",
        });
      }

      return res.json({
        success: true,
        message: "Order status updated.",
        order,
      });
    } catch (error) {
      console.error("Update order status error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Failed to update order status.",
      });
    }
  }
);

// -------------------- START SERVER --------------------

async function startServer() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is missing from .env");
    process.exit(1);
  }

  if (
    !process.env.JWT_SECRET ||
    process.env.JWT_SECRET.length < 32
  ) {
    console.error(
      "JWT_SECRET is missing or too short. Set a strong secret in .env."
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected.");
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB error:", error.message);
});

startServer();
