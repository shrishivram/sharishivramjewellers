import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { OAuth2Client } from "google-auth-library";
import cookieSession from "cookie-session";
import dotenv from "dotenv";

console.log("Server script starting...");
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("jewellery.db");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const APP_URL = process.env.APP_URL;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn("WARNING: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing. Google OAuth will not work.");
}

// Initialize database
try {
  console.log("Initializing database...");
  
  // Ensure users table exists before migration
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      phone TEXT UNIQUE,
      name TEXT,
      password TEXT,
      otp TEXT,
      role TEXT DEFAULT 'user',
      status TEXT DEFAULT 'active',
      avatar TEXT,
      aadharNumber TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migration: Ensure all columns exist in users table
  try {
    const tableInfo = db.prepare("PRAGMA table_info(users)").all() as any[];
    const columns = tableInfo.map((c: any) => c.name);
    if (!columns.includes('role')) db.exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'");
    if (!columns.includes('status')) db.exec("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active'");
    if (!columns.includes('avatar')) db.exec("ALTER TABLE users ADD COLUMN avatar TEXT");
    if (!columns.includes('aadharNumber')) db.exec("ALTER TABLE users ADD COLUMN aadharNumber TEXT");
    if (!columns.includes('otp')) db.exec("ALTER TABLE users ADD COLUMN otp TEXT");
    if (!columns.includes('total_purchase')) db.exec("ALTER TABLE users ADD COLUMN total_purchase REAL DEFAULT 0");
  } catch (migrationError) {
    console.warn("Migration failed or not needed:", migrationError);
  }

  db.exec(`
  CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT,
    details TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    image TEXT,
    parent_id INTEGER DEFAULT NULL,
    FOREIGN KEY (parent_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER,
    name TEXT,
    description TEXT,
    price REAL,
    image TEXT,
    is_featured BOOLEAN DEFAULT 0,
    stock INTEGER DEFAULT 0,
    weight TEXT,
    purity TEXT,
    material TEXT, -- Gold, Diamond, Silver
    status TEXT DEFAULT 'active', -- active, inactive
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS product_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    url TEXT,
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS wishlist (
    user_id INTEGER,
    product_id INTEGER,
    PRIMARY KEY (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    total REAL,
    status TEXT DEFAULT 'pending', -- pending, confirmed, shipped, delivered, returned
    payment_status TEXT DEFAULT 'pending', -- pending, paid, failed
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    price REAL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    user_name TEXT,
    rating INTEGER,
    comment TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS deals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    discount TEXT,
    image TEXT,
    expiry_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    email TEXT,
    subject TEXT,
    message TEXT,
    status TEXT DEFAULT 'unread', -- unread, read, replied
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Seed initial data if empty
const categoryCount = db.prepare("SELECT COUNT(*) as count FROM categories").get() as { count: number };
if (categoryCount.count === 0) {
  const insertCategory = db.prepare("INSERT INTO categories (name, image) VALUES (?, ?)");
  insertCategory.run("Necklaces", "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800");
  insertCategory.run("Rings", "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800");
  insertCategory.run("Earrings", "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800");
  insertCategory.run("Bracelets", "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800");

  const insertProduct = db.prepare("INSERT INTO products (category_id, name, description, price, image, is_featured, stock, weight, purity, material) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  insertProduct.run(1, "Royal Diamond Necklace", "Exquisite diamond necklace for special occasions.", 250000, "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800", 1, 10, "45g", "22K", "Diamond");
  insertProduct.run(1, "Gold Choker", "Traditional gold choker with intricate designs.", 120000, "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800", 1, 15, "30g", "24K", "Gold");
  insertProduct.run(2, "Emerald Drop Earrings", "Stunning emerald earrings with gold finish.", 45000, "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800", 1, 20, "10g", "18K", "Gold");
  insertProduct.run(2, "Diamond Studs", "Classic diamond studs for everyday elegance.", 35000, "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800", 1, 25, "5g", "18K", "Diamond");
}

// Seed Admin Users
const adminEmails = ["pranaysoni78@gmail.com", "cs22.pranay.soni@lcit.edu.in"];
adminEmails.forEach(email => {
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
  if (!user) {
    db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)").run(
      email.split('@')[0],
      email,
      "pranaysoni@7879",
      "super_admin"
    );
  } else if (user.role !== 'super_admin') {
    db.prepare("UPDATE users SET role = 'super_admin' WHERE email = ?").run(email);
  }
});

// Seed Site Settings
const settingsCount = db.prepare("SELECT COUNT(*) as count FROM site_settings").get() as { count: number };
if (settingsCount.count === 0) {
  const insertSetting = db.prepare("INSERT INTO site_settings (key, value) VALUES (?, ?)");
  insertSetting.run("site_name", "LuxeLoom");
  insertSetting.run("site_logo", "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800");
  insertSetting.run("theme", "light");
}
} catch (error) {
  console.error("Database initialization failed:", error);
  process.exit(1);
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);

  app.set("trust proxy", 1);
  app.use(express.json());

  app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });
  app.use(cookieSession({
    name: 'session',
    keys: [process.env.SESSION_SECRET || 'luxe-loom-secret'],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: true,
    sameSite: 'none',
    httpOnly: true,
  }));

  // API Routes
  app.get("/api/auth/google/url", (req, res) => {
    const redirectUri = `${APP_URL}/auth/google/callback`;
    const url = client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"],
      redirect_uri: redirectUri,
    });
    res.json({ url });
  });

  app.get("/auth/google/callback", async (req, res) => {
    const { code } = req.query;
    const redirectUri = `${APP_URL}/auth/google/callback`;
    
    try {
      const { tokens } = await client.getToken({
        code: code as string,
        redirect_uri: redirectUri,
      });
      client.setCredentials(tokens);

      const userInfoRes = await client.request({
        url: "https://www.googleapis.com/oauth2/v3/userinfo",
      });
      const userInfo = userInfoRes.data as any;

      const email = userInfo.email;
      const name = userInfo.name;

      let user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
      if (!user) {
        const info = db.prepare("INSERT INTO users (email, name) VALUES (?, ?)").run(email, name);
        user = { id: Number(info.lastInsertRowid), email, name };
      }

      // Store user in session
      (req as any).session.user = user;

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', user: ${JSON.stringify(user)} }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Google Auth Error:", error);
      res.status(500).send("Authentication failed");
    }
  });

  app.get("/api/auth/me", (req, res) => {
    let user = (req as any).session.user;
    if (user) {
      const dbUser = db.prepare("SELECT * FROM users WHERE id = ?").get(user.id) as any;
      if (dbUser) {
        user = dbUser;
        (req as any).session.user = dbUser;
      }
    }
    res.json({ user: user || null });
  });

  app.get("/api/settings", (req, res) => {
    const settings = db.prepare("SELECT * FROM site_settings").all();
    const settingsObj = settings.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.json(settingsObj);
  });

  app.get("/api/categories", (req, res) => {
    const categories = db.prepare("SELECT * FROM categories").all();
    res.json(categories);
  });

  // Admin Middleware
  const isAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const sessionUser = (req as any).session.user;
    
    if (!sessionUser) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Always fetch latest user data from DB to check role
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(sessionUser.id) as any;

    if (user && (user.role === 'admin' || user.role === 'super_admin' || user.role === 'moderator')) {
      (req as any).session.user = user; // Update session with latest data
      next();
    } else {
      res.status(403).json({ error: "Unauthorized" });
    }
  };

  // Admin API Routes
  app.get("/api/admin/stats", isAdmin, (req, res) => {
    try {
      const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;
      const activeUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE status = 'active'").get() as any;
      const totalOrders = db.prepare("SELECT COUNT(*) as count FROM orders").get() as any;
      const totalRevenue = db.prepare("SELECT SUM(total) as sum FROM orders").get() as any;
      const pendingOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'").get() as any;
      const totalProducts = db.prepare("SELECT COUNT(*) as count FROM products").get() as any;
      const lowStockItems = db.prepare("SELECT COUNT(*) as count FROM products WHERE stock < 10").get() as any;
      
      const recentOrders = db.prepare("SELECT o.*, u.name as user_name FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 5").all();
      const recentLogs = db.prepare("SELECT l.*, u.name as user_name FROM activity_logs l LEFT JOIN users u ON l.user_id = u.id ORDER BY l.created_at DESC LIMIT 5").all();
      
      // Sales Analytics (Last 7 days)
      const salesAnalytics = db.prepare(`
        SELECT date(created_at) as date, SUM(total) as revenue, COUNT(*) as orders
        FROM orders
        WHERE created_at >= date('now', '-7 days')
        GROUP BY date(created_at)
        ORDER BY date(created_at) ASC
      `).all();

      // Category Distribution
      const categoryDistribution = db.prepare(`
        SELECT c.name, COUNT(p.id) as value
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id
        GROUP BY c.id
      `).all();

      // Top Selling Products
      const topSellingProducts = db.prepare(`
        SELECT p.*, SUM(oi.quantity) as sales
        FROM products p
        JOIN order_items oi ON p.id = oi.product_id
        GROUP BY p.id
        ORDER BY sales DESC
        LIMIT 4
      `).all();

      // Recent Reviews
      const recentReviews = db.prepare(`
        SELECT r.*, p.name as product_name
        FROM reviews r
        JOIN products p ON r.product_id = p.id
        ORDER BY r.date DESC
        LIMIT 3
      `).all();

      res.json({
        totalUsers: totalUsers.count,
        activeUsers: activeUsers.count,
        totalOrders: totalOrders.count,
        totalRevenue: totalRevenue.sum || 0,
        pendingOrders: pendingOrders.count,
        totalProducts: totalProducts.count,
        lowStockItems: lowStockItems.count,
        recentOrders,
        recentLogs,
        salesAnalytics,
        categoryDistribution,
        topSellingProducts,
        recentReviews
      });
    } catch (e) {
      console.error("Stats fetch error:", e);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/admin/users", isAdmin, (req, res) => {
    const users = db.prepare("SELECT id, name, email, phone, role, status, total_purchase, created_at FROM users").all();
    res.json(users);
  });

  app.post("/api/admin/users/:id/status", isAdmin, (req, res) => {
    const { status } = req.body;
    db.prepare("UPDATE users SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ success: true });
  });

  app.post("/api/admin/users/:id/role", isAdmin, (req, res) => {
    const { role } = req.body;
    db.prepare("UPDATE users SET role = ? WHERE id = ?").run(role, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/admin/users/:id", isAdmin, (req, res) => {
    db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/admin/orders", isAdmin, (req, res) => {
    const orders = db.prepare("SELECT o.*, u.name as user_name FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC").all();
    res.json(orders);
  });

  app.get("/api/admin/orders/:id/items", isAdmin, (req, res) => {
    const items = db.prepare(`
      SELECT oi.*, p.name as product_name, p.image as product_image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).all(req.params.id);
    res.json(items);
  });

  app.post("/api/admin/orders/:id/status", isAdmin, (req, res) => {
    const { status, payment_status } = req.body;
    if (status) db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, req.params.id);
    if (payment_status) db.prepare("UPDATE orders SET payment_status = ? WHERE id = ?").run(payment_status, req.params.id);
    res.json({ success: true });
  });

  app.get("/api/admin/logs", isAdmin, (req, res) => {
    const logs = db.prepare("SELECT l.*, u.name as user_name FROM activity_logs l LEFT JOIN users u ON l.user_id = u.id ORDER BY l.created_at DESC LIMIT 100").all();
    res.json(logs);
  });

  app.get("/api/admin/settings", isAdmin, (req, res) => {
    const settings = db.prepare("SELECT * FROM site_settings").all();
    const settingsObj = settings.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.json(settingsObj);
  });

  app.post("/api/admin/settings", isAdmin, (req, res) => {
    const settings = req.body;
    const upsert = db.prepare("INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)");
    Object.entries(settings).forEach(([key, value]) => {
      upsert.run(key, value as string);
    });
    res.json({ success: true });
  });

  // Admin Product Management
  app.get("/api/admin/products", isAdmin, (req, res) => {
    const products = db.prepare("SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id").all();
    res.json(products);
  });

  app.post("/api/admin/products", isAdmin, (req, res) => {
    const { category_id, name, description, price, image, is_featured, stock, weight, purity, material, status } = req.body;
    try {
      const info = db.prepare("INSERT INTO products (category_id, name, description, price, image, is_featured, stock, weight, purity, material, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(category_id, name, description, price, image, is_featured ? 1 : 0, stock || 0, weight, purity, material, status || 'active');
      res.json({ success: true, id: info.lastInsertRowid });
    } catch (e) {
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.put("/api/admin/products/:id", isAdmin, (req, res) => {
    const { category_id, name, description, price, image, is_featured, stock, weight, purity, material, status } = req.body;
    try {
      db.prepare("UPDATE products SET category_id = ?, name = ?, description = ?, price = ?, image = ?, is_featured = ?, stock = ?, weight = ?, purity = ?, material = ?, status = ? WHERE id = ?")
        .run(category_id, name, description, price, image, is_featured ? 1 : 0, stock || 0, weight, purity, material, status || 'active', req.params.id);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/admin/products/:id", isAdmin, (req, res) => {
    try {
      db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Admin Category Management
  app.get("/api/admin/categories", isAdmin, (req, res) => {
    const categories = db.prepare("SELECT * FROM categories").all();
    res.json(categories);
  });

  app.post("/api/admin/categories", isAdmin, (req, res) => {
    const { name, image, parent_id } = req.body;
    try {
      const info = db.prepare("INSERT INTO categories (name, image, parent_id) VALUES (?, ?, ?)").run(name, image, parent_id || null);
      res.json({ success: true, id: info.lastInsertRowid });
    } catch (e) {
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  app.put("/api/admin/categories/:id", isAdmin, (req, res) => {
    const { name, image, parent_id } = req.body;
    try {
      db.prepare("UPDATE categories SET name = ?, image = ?, parent_id = ? WHERE id = ?").run(name, image, parent_id || null, req.params.id);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to update category" });
    }
  });

  app.delete("/api/admin/categories/:id", isAdmin, (req, res) => {
    try {
      db.prepare("DELETE FROM categories WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  // Messages API
  app.get("/api/admin/messages", isAdmin, (req, res) => {
    const messages = db.prepare("SELECT m.*, u.name as user_name FROM messages m LEFT JOIN users u ON m.user_id = u.id ORDER BY m.created_at DESC").all();
    res.json(messages);
  });

  app.post("/api/admin/messages/:id/status", isAdmin, (req, res) => {
    const { status } = req.body;
    db.prepare("UPDATE messages SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/admin/messages/:id", isAdmin, (req, res) => {
    db.prepare("DELETE FROM messages WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Admin Deals Management
  app.put("/api/admin/deals/:id", isAdmin, (req, res) => {
    const { title, description, discount, image, expiryDate } = req.body;
    try {
      db.prepare("UPDATE deals SET title = ?, description = ?, discount = ?, image = ?, expiry_date = ? WHERE id = ?")
        .run(title, description, discount, image, expiryDate, req.params.id);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to update deal" });
    }
  });

  app.delete("/api/admin/deals/:id", isAdmin, (req, res) => {
    try {
      db.prepare("DELETE FROM deals WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to delete deal" });
    }
  });

  app.get("/api/products/:id", (req, res) => {
    const product = db.prepare("SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?").get(req.params.id) as any;
    if (!product) return res.status(404).json({ error: "Product not found" });
    const reviews = db.prepare("SELECT * FROM reviews WHERE product_id = ? ORDER BY date DESC").all(product.id);
    res.json({ ...product, reviews });
  });

  app.get("/api/products", (req, res) => {
    const products = db.prepare("SELECT * FROM products").all() as any[];
    const productsWithReviews = products.map(p => {
      const reviews = db.prepare("SELECT * FROM reviews WHERE product_id = ? ORDER BY date DESC").all(p.id);
      return { ...p, reviews };
    });
    res.json(productsWithReviews);
  });

  app.post("/api/reviews", (req, res) => {
    const { productId, userName, rating, comment } = req.body;
    try {
      db.prepare("INSERT INTO reviews (product_id, user_name, rating, comment) VALUES (?, ?, ?, ?)").run(productId, userName, rating, comment);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to add review" });
    }
  });

  app.get("/api/products/featured", (req, res) => {
    const products = db.prepare("SELECT * FROM products WHERE is_featured = 1").all();
    res.json(products);
  });

  app.get("/api/deals", (req, res) => {
    const deals = db.prepare("SELECT * FROM deals ORDER BY created_at DESC").all();
    res.json(deals);
  });

  app.post("/api/deals", (req, res) => {
    const { title, description, discount, image, expiryDate } = req.body;
    try {
      db.prepare("INSERT INTO deals (title, description, discount, image, expiry_date) VALUES (?, ?, ?, ?, ?)").run(title, description, discount, image, expiryDate);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to add deal" });
    }
  });

  // Simple Auth Simulation
  app.post("/api/auth/login", (req, res) => {
    const { email, phone, password } = req.body;
    
    if (email && password) {
      const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
      if (user && user.password === password) {
        if (user.status === 'blocked') {
          return res.status(403).json({ success: false, message: "Your account has been blocked" });
        }
        (req as any).session.user = user;
        // Log activity
        db.prepare("INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)").run(user.id, "login", `User ${user.email} logged in`);
        return res.json({ success: true, user });
      }
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    let user = db.prepare("SELECT * FROM users WHERE email = ? OR phone = ?").get(email, phone) as any;
    
    if (!user) {
      const info = db.prepare("INSERT INTO users (email, phone, name) VALUES (?, ?, ?)").run(email, phone, email?.split('@')[0] || 'User');
      user = { id: info.lastInsertRowid, email, phone, name: email?.split('@')[0] || 'User', role: 'user', status: 'active' };
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ success: false, message: "Your account has been blocked" });
    }
    
    (req as any).session.user = user;
    res.json({ success: true, user });
  });

  app.post("/api/auth/signup", (req, res) => {
    const { email, phone, name, password } = req.body;
    try {
      const info = db.prepare("INSERT INTO users (email, phone, name, password) VALUES (?, ?, ?, ?)").run(email, phone, name, password);
      const user = { id: info.lastInsertRowid, email, phone, name };
      (req as any).session.user = user;
      res.json({ success: true, user });
    } catch (e) {
      res.status(400).json({ success: false, message: "User already exists" });
    }
  });

  // Wishlist
  app.get("/api/wishlist/:userId", (req, res) => {
    const products = db.prepare(`
      SELECT p.* FROM products p
      JOIN wishlist w ON p.id = w.product_id
      WHERE w.user_id = ?
    `).all(req.params.userId);
    res.json(products);
  });

  app.post("/api/wishlist", (req, res) => {
    const { userId, productId } = req.body;
    try {
      db.prepare("INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)").run(userId, productId);
      res.json({ success: true });
    } catch (e) {
      db.prepare("DELETE FROM wishlist WHERE user_id = ? AND product_id = ?").run(userId, productId);
      res.json({ success: true, removed: true });
    }
  });

  // Orders
  app.get("/api/orders/:userId", (req, res) => {
    const orders = db.prepare(`
      SELECT o.*, 
             (SELECT p.name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = o.id LIMIT 1) as name,
             (SELECT p.image FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = o.id LIMIT 1) as image
      FROM orders o 
      WHERE o.user_id = ? 
      ORDER BY o.created_at DESC
    `).all(req.params.userId);
    res.json(orders);
  });

  app.post("/api/orders", (req, res) => {
    const { userId, items, total, shippingAddress, paymentMethod } = req.body;
    try {
      const info = db.prepare("INSERT INTO orders (user_id, total, status, payment_status) VALUES (?, ?, ?, ?)").run(userId, total, 'pending', 'paid');
      const orderId = info.lastInsertRowid;

      const insertItem = db.prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
      items.forEach((item: any) => {
        insertItem.run(orderId, item.id, item.quantity, item.price);
      });

      // Log activity
      db.prepare("INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)").run(userId, "order_placed", `User placed order #ORD-${orderId}`);

      res.json({ success: true, orderId });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to place order" });
    }
  });

  // 404 for API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({ error: "API route not found" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    try {
      console.log("Starting Vite in middleware mode...");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("Vite middleware initialized");
    } catch (viteError) {
      console.error("Failed to initialize Vite middleware:", viteError);
      process.exit(1);
    }
  } else {
    console.log("Serving static files from dist");
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Unhandled Error:", err);
    if (res.headersSent) {
      return next(err);
    }
    if (req.path.startsWith('/api')) {
      res.status(500).json({ error: "Internal Server Error", message: err.message });
    } else {
      next(err);
    }
  });

  console.log(`Attempting to start server on port ${PORT}...`);
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
