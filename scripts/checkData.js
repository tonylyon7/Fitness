import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../models/product.model.js';
import Coach from '../models/coach.model.js';

// Get current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../config/.env') });

// Sample product data
const sampleProducts = [
  {
    name: "Premium Protein Powder",
    description: "High-quality whey protein for muscle recovery and growth",
    price: 49.99,
    category: "supplements",
    images: ["https://example.com/protein.jpg"],
    stock: 100,
    specifications: [
      { name: "Weight", value: "2kg" },
      { name: "Servings", value: "30" },
      { name: "Protein per serving", value: "25g" }
    ]
  },
  {
    name: "Adjustable Dumbbells",
    description: "Space-saving adjustable dumbbells for home workouts",
    price: 199.99,
    category: "equipment",
    images: ["https://example.com/dumbbells.jpg"],
    stock: 25,
    specifications: [
      { name: "Weight Range", value: "5-50 lbs" },
      { name: "Material", value: "Steel and rubber" }
    ]
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Get MongoDB URI with fallbacks for different environments
    let mongoUri = process.env.MONGO_URL || process.env.MONGODB_URI;
    
    // If we're not in production and have a test URI, use that instead
    if (process.env.NODE_ENV !== 'production' && process.env.MONGO_TEST) {
      mongoUri = process.env.MONGO_TEST;
    }
    
    if (!mongoUri) {
      throw new Error('MongoDB connection URI is not defined');
    }
    
    // Fix database name case sensitivity issue
    // Extract the database name from the URI
    const dbNameMatch = mongoUri.match(/\/([^\/\?]+)(\?|$)/);
    if (dbNameMatch && dbNameMatch[1]) {
      const dbName = dbNameMatch[1];
      // Replace with the correct database name (Fitness with capital F)
      mongoUri = mongoUri.replace(`/${dbName}`, '/Fitness');
      console.log(`Adjusted database name in connection string to 'Fitness'`);
    }

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      w: 'majority'
    };

    await mongoose.connect(mongoUri, options);
    console.log('Connected to MongoDB successfully!');
    
    // Check if products exist
    const productCount = await Product.countDocuments();
    console.log(`Found ${productCount} products in the database`);
    
    // Check if coaches exist
    const coachCount = await Coach.countDocuments();
    console.log(`Found ${coachCount} coaches in the database`);

    // If no products, seed sample data
    if (productCount === 0) {
      console.log('No products found. Seeding sample products...');
      await Product.insertMany(sampleProducts);
      console.log('Sample products added successfully!');
    }

    console.log('Data check complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

connectDB();
