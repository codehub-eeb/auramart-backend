#  AuraMart – Backend

### Full-Stack E-Commerce Application | REST API | JWT Authentication

AuraMart is a full-stack e-commerce application backend built using **Node.js, Express.js, and MongoDB**. It provides RESTful APIs for user authentication, product management, and order processing.

The backend implements JWT-based authentication, password hashing, role-based access control, protected routes, and database integration to support a secure and structured e-commerce application.

---

##  Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript Runtime |
| Express.js | Backend Framework |
| MongoDB | NoSQL Database |
| Mongoose | Database Modeling |
| JWT (jsonwebtoken) | Authentication |
| bcryptjs | Password Hashing |
| CORS | Cross-Origin Resource Sharing |
| dotenv | Environment Configuration |

---

##  Key Features

###  1. Authentication & Authorization

- User Registration and Login.
- JWT-based authentication.
- Password hashing using bcryptjs with 12 salt rounds.
- JWT tokens with 1-day expiration.
- Protected routes using authentication middleware.
- Role-Based Access Control (RBAC).
- Separate Admin and User permissions.

###  2. Product Management

- Retrieve all available products.
- Retrieve individual products by ID.
- Add new products (Admin only).
- Update existing products (Admin only).
- Delete products (Admin only).
- Product input validation.
- Stock, price, rating, and review validation.

###  3. Order Management

- Place orders with shipping details.
- Support for Cash on Delivery (COD) and ONLINE payment method selection.
- Validate product availability and quantities.
- Calculate order subtotal and total amount.
- Retrieve customer-specific orders.
- Admin access to all customer orders.
- Update order status.

###  4. Security & Validation

- Passwords are never stored as plain text.
- JWT verification for protected API endpoints.
- Admin authorization middleware.
- Input validation and error handling.
- Invalid MongoDB ObjectId validation.
- Environment variables for sensitive configuration.
- Password length validation.

---

##  Authentication Flow

1. User registers with name, email, mobile number, and password.
2. Password is hashed using bcryptjs.
3. User credentials are stored in MongoDB.
4. During login, the entered password is compared with the stored hash.
5. On successful authentication, a JWT token is generated.
6. The token is sent with protected API requests using the Bearer token format.
7. Middleware verifies the token and identifies the authenticated user.
8. Admin-only routes additionally check the user's role.

**Authorization Header:**

```http
Authorization: Bearer <JWT_TOKEN>
```

---

## 📡 API Endpoints

Base URL (Local):

```text
http://localhost:5000
```

### Authentication Routes

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get authenticated user |

### Product Routes

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/products` | Public |
| GET | `/api/products/:id` | Public |
| POST | `/api/products` | Admin |
| PUT | `/api/products/:id` | Admin |
| DELETE | `/api/products/:id` | Admin |

### Order Routes

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/orders` | Authenticated User |
| GET | `/api/orders/my-orders` | Authenticated User |
| GET | `/api/orders` | Admin |
| PATCH | `/api/orders/:id/status` | Admin |

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Check backend server |
| GET | `/api/health` | Check API and database connection |

---

##  Role-Based Access Control

AuraMart uses two user roles:

**1. User**
- Register and log in.
- Browse products.
- Place orders.
- View personal order history.

**2. Admin**
- Add, update, and delete products.
- View all customer orders.
- Update order statuses.

Admin access is protected using authentication and authorization middleware.

---

##  Project Structure

```text
auramart-backend/
│
├── models/
│   ├── Product.js
│   ├── User.js
│   └── Order.js
│
├── .gitignore
├── index.js
├── package.json
├── package-lock.json
├── seedProducts.js
└── README.md
```

---

##  Installation & Setup

**Step 1: Clone the repository**

```bash
git clone https://github.com/codehub-eeb/auramart-backend.git
```

**Step 2: Navigate to the project directory**

```bash
cd auramart-backend
```

**Step 3: Install dependencies**

```bash
npm install
```

**Step 4: Configure environment variables**

Create a `.env` file in the root directory.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret_key_at_least_32_characters
```

**Step 5: Start the backend server**

```bash
node index.js
```

The server will run at:

```text
http://localhost:5000
```

---

## 🗄️ Database

AuraMart uses MongoDB with Mongoose for database connectivity and data modeling.

The backend uses three main models:

- **User:** Stores user account and authentication information.
- **Product:** Stores product details such as name, price, category, stock, and ratings.
- **Order:** Stores customer orders, shipping information, payment method, and order status.

---

##  API Testing

The REST API endpoints can be tested using tools such as:

- Postman
- Thunder Client

Test authentication, product operations, protected routes, and order management endpoints.

---

##  Project Links

**Frontend Repository:**  
https://github.com/codehub-eeb/AURAMART

**Backend Repository:**  
https://github.com/codehub-eeb/auramart-backend

**Live Application:**  
https://auramart-nine.vercel.app/

---

##  Developer

**Shaan G. Teli**  
Third-Year B.E. Information Technology Student  
Full-Stack Web Developer

- GitHub: https://github.com/codehub-eeb
- LinkedIn: https://www.linkedin.com/in/shaan-teli-8419a2328
- Portfolio: https://shaan-portfolio-rosy.vercel.app/

---

 If you find this project interesting, feel free to explore the repository!

### Built with passion for learning and developing full-stack applications.
