import mongoose from 'mongoose';
import Product from '../models/product.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../config/.env') });

const baseProducts = [
  // Equipment Category
  {
    name: 'Adjustable Dumbbell Set',
    description: 'Professional adjustable dumbbell set for home and commercial use. Space-saving design with quick weight adjustment mechanism.',
    price: 299.99,
    category: 'equipment',
    images: ['/assets/products/equipment/adjustable-dumbbell-set.jpeg'],
    stock: 50,
    specifications: [
      { name: 'Weight Range', value: '5-52.5 lbs per dumbbell' },
      { name: 'Adjustment Increments', value: '2.5 lbs' },
      { name: 'Material', value: 'Steel with rubber grip' }
    ],
    rating: { average: 4.9, count: 256 }
  },
  {
    name: 'Olympic Flat Bench',
    description: 'Commercial grade flat bench perfect for bench press and dumbbell exercises. Stable and comfortable design.',
    price: 199.99,
    category: 'equipment',
    images: ['/assets/products/equipment/olympic-flat-bench.jpeg'],
    stock: 30,
    specifications: [
      { name: 'Weight Capacity', value: '1000 lbs' },
      { name: 'Padding', value: 'High-density foam' },
      { name: 'Frame', value: 'Heavy-duty steel' }
    ],
    rating: { average: 4.8, count: 189 }
  },
  {
    name: 'Foam Roller',
    description: 'High-density foam roller for muscle recovery and myofascial release. Perfect for pre and post-workout.',
    price: 29.99,
    category: 'equipment',
    images: ['/assets/products/equipment/foam-roller.jpeg'],
    stock: 100,
    specifications: [
      { name: 'Length', value: '18 inches' },
      { name: 'Material', value: 'High-density EVA foam' },
      { name: 'Surface', value: 'Textured pattern' }
    ],
    rating: { average: 4.7, count: 312 }
  },
  {
    name: 'Push-Up Board',
    description: 'Multi-position push-up board with color-coded targets for different muscle groups.',
    price: 39.99,
    category: 'equipment',
    images: ['/assets/products/equipment/push-up-board.jpeg'],
    stock: 150,
    specifications: [
      { name: 'Material', value: 'Heavy-duty plastic' },
      { name: 'Positions', value: '30+ exercise combinations' },
      { name: 'Features', value: 'Non-slip base, ergonomic handles' }
    ],
    rating: { average: 4.6, count: 245 }
  },
  {
    name: 'Adjustable Bench',
    description: 'Multi-position adjustable weight bench.',
    price: 169.99,
    category: 'equipment',
    images: ['/assets/products/equipment/adjustable-bench.jpeg'],
    stock: 25,
    specifications: [
      { name: 'Positions', value: '7 back, 3 seat' },
      { name: 'Weight Capacity', value: '800 lbs' }
    ],
    rating: { average: 4.6, count: 234 }
  },
  // Supplements Category
  {
    name: 'Whey Protein Gold',
    description: 'Premium gold standard whey protein with 24g protein per serving. Fast-absorbing formula for optimal muscle recovery.',
    price: 59.99,
    category: 'supplements',
    images: ['/assets/products/supplements/whey-protein-gold.jpeg'],
    stock: 200,
    specifications: [
      { name: 'Protein per serving', value: '24g' },
      { name: 'Servings', value: '30' },
      { name: 'Flavors', value: 'Chocolate, Vanilla, Strawberry' },
      { name: 'Type', value: 'Whey Protein Isolate' }
    ],
    rating: { average: 4.8, count: 423 }
  },
  {
    name: 'Pre-Workout Energy',
    description: 'Advanced pre-workout formula for explosive energy, enhanced focus, and maximum performance.',
    price: 44.99,
    category: 'supplements',
    images: ['/assets/products/supplements/pre-workout-energy.jpeg'],
    stock: 150,
    specifications: [
      { name: 'Servings', value: '30' },
      { name: 'Caffeine', value: '200mg per serving' },
      { name: 'Key Ingredients', value: 'Beta-Alanine, L-Citrulline, Caffeine' }
    ],
    rating: { average: 4.7, count: 312 }
  },
  {
    name: 'Creatine Monohydrate',
    description: 'Pure micronized creatine monohydrate powder for increased strength, power, and muscle recovery.',
    price: 29.99,
    category: 'supplements',
    images: ['/assets/products/supplements/creatine-monohydrate.jpeg'],
    stock: 180,
    specifications: [
      { name: 'Serving Size', value: '5g' },
      { name: 'Servings', value: '60' },
      { name: 'Type', value: 'Micronized Powder' }
    ],
    rating: { average: 4.9, count: 567 }
  },
  {
    name: 'Multivitamin Pack',
    description: 'Complete daily multivitamin pack with essential vitamins, minerals, and antioxidants.',
    price: 34.99,
    category: 'supplements',
    images: ['/assets/products/supplements/multivitamin-pack.jpeg'],
    stock: 250,
    specifications: [
      { name: 'Servings', value: '30 packs' },
      { name: 'Contents', value: 'Vitamins A-Z, Minerals, Omega-3' },
      { name: 'Usage', value: '1 pack daily' }
    ],
    rating: { average: 4.8, count: 389 }
  },
  {
    name: 'Mass Gainer',
    description: 'High-calorie protein powder for muscle gain.',
    price: 54.99,
    category: 'supplements',
    images: ['/images/products/supplements/mass-gainer.jpg'],
    stock: 120,
    specifications: [
      { name: 'Calories', value: '1250 per serving' },
      { name: 'Protein', value: '50g per serving' }
    ],
    rating: { average: 4.5, count: 234 }
  },
  {
    name: 'Protein Bars',
    description: 'High-protein bars for post-workout recovery.',
    price: 39.99,
    category: 'supplements',
    images: ['/assets/products/supplements/protein-bars.jpeg'],
    stock: 180,
    specifications: [
      { name: 'Protein per serving', value: '20g' },
      { name: 'Servings', value: '12' }
    ],
    rating: { average: 4.5, count: 156 }
  },
  {
    name: 'Glutamine Powder',
    description: 'Pure glutamine powder for muscle recovery.',
    price: 29.99,
    category: 'supplements',
    images: ['/images/products/supplements/glutamine.jpg'],
    stock: 200,
    specifications: [
      { name: 'Servings', value: '50' },
      { name: 'Size', value: '500g' }
    ],
    rating: { average: 4.6, count: 145 }
  },
  {
    name: 'HMB Powder',
    description: 'Pure HMB powder for muscle recovery.',
    price: 39.99,
    category: 'supplements',
    images: ['/assets/products/supplements/hmb.jpeg'],
    stock: 150,
    specifications: [
      { name: 'Servings', value: '50' },
      { name: 'Size', value: '500g' }
    ],
    rating: { average: 4.5, count: 123 }
  },
  {
    name: 'L-Glutamine Capsules',
    description: 'L-glutamine capsules for muscle recovery.',
    price: 24.99,
    category: 'supplements',
    images: ['/assets/products/supplements/l-glutamine.jpeg'],
    stock: 250,
    specifications: [
      { name: 'Servings', value: '100' },
      { name: 'Size', value: '500mg per capsule' }
    ],
    rating: { average: 4.5, count: 145 }
  },
  {
    name: 'L-Arginine Powder',
    description: 'Pure L-arginine powder for blood flow.',
    price: 34.99,
    category: 'supplements',
    images: ['/images/products/supplements/l-arginine.jpg'],
    stock: 180,
    specifications: [
      { name: 'Servings', value: '50' },
      { name: 'Size', value: '500g' }
    ],
    rating: { average: 4.5, count: 123 }
  },
  // Apparel Category
  {
    name: 'Performance T-Shirt Black',
    description: 'Premium moisture-wicking athletic t-shirt with quick-dry technology. Perfect for intense workouts.',
    price: 29.99,
    category: 'apparel',
    images: ['/assets/products/apparel/performance-tshirt-black.jpeg'],
    stock: 300,
    specifications: [
      { name: 'Material', value: '90% Polyester, 10% Spandex' },
      { name: 'Sizes', value: 'S, M, L, XL' },
      { name: 'Features', value: 'Quick-dry, Anti-odor, UV protection' }
    ],
    rating: { average: 4.7, count: 278 }
  },
  {
    name: 'Compression Leggings',
    description: 'High-waisted compression leggings with phone pockets and tummy control. Perfect for yoga and high-intensity workouts.',
    price: 49.99,
    category: 'apparel',
    images: ['/assets/products/apparel/compression-leggings.jpeg'],
    stock: 250,
    specifications: [
      { name: 'Material', value: '75% Nylon, 25% Spandex' },
      { name: 'Sizes', value: 'XS, S, M, L, XL' },
      { name: 'Features', value: 'High-waisted, Phone pockets, Squat-proof' }
    ],
    rating: { average: 4.8, count: 345 }
  },
  {
    name: 'Training Shorts',
    description: 'Lightweight, quick-dry training shorts with built-in liner and zip pockets.',
    price: 34.99,
    category: 'apparel',
    images: ['/assets/products/apparel/training-shorts.jpeg'],
    stock: 200,
    specifications: [
      { name: 'Material', value: '92% Polyester, 8% Spandex' },
      { name: 'Sizes', value: 'S, M, L, XL' },
      { name: 'Features', value: 'Built-in liner, Zip pockets, Quick-dry' }
    ],
    rating: { average: 4.6, count: 256 }
  },
  {
    name: 'Training Hoodie',
    description: 'Premium performance hoodie with moisture-wicking fabric and kangaroo pocket.',
    price: 44.99,
    category: 'apparel',
    images: ['/assets/products/apparel/training-hoodie.jpeg'],
    stock: 180,
    specifications: [
      { name: 'Material', value: '88% Polyester, 12% Spandex' },
      { name: 'Sizes', value: 'S, M, L, XL' },
      { name: 'Features', value: 'Moisture-wicking, Kangaroo pocket, Thumbholes' }
    ],
    rating: { average: 4.7, count: 234 }
  },
  {
    name: 'Compression Socks',
    description: 'Athletic compression socks for improved circulation.',
    price: 19.99,
    category: 'apparel',
    images: ['/assets/products/apparel/compression-socks.jpeg'],
    stock: 400,
    specifications: [
      { name: 'Material', value: '85% Nylon, 15% Spandex' },
      { name: 'Sizes', value: 'S/M, L/XL' }
    ],
    rating: { average: 4.4, count: 145 }
  },
  {
    name: 'Sports Bra',
    description: 'Medium-impact sports bra for women.',
    price: 29.99,
    category: 'apparel',
    images: ['/assets/products/apparel/sports-bra.jpeg'],
    stock: 250,
    specifications: [
      { name: 'Material', value: '80% Nylon, 20% Spandex' },
      { name: 'Sizes', value: 'XS, S, M, L' }
    ],
    rating: { average: 4.5, count: 156 }
  },
  {
    name: 'Running Shoes',
    description: 'High-performance running shoes for men.',
    price: 99.99,
    category: 'apparel',
    images: ['/assets/products/apparel/running-shoes.jpeg'],
    stock: 150,
    specifications: [
      { name: 'Material', value: 'Upper: Mesh, Sole: Rubber' },
      { name: 'Sizes', value: '7, 8, 9, 10, 11' }
    ],
    rating: { average: 4.6, count: 123 }
  },
  {
    name: 'Yoga Pants',
    description: 'Four-way stretch yoga pants for women.',
    price: 39.99,
    category: 'apparel',
    images: ['/assets/products/apparel/yoga-pants.jpeg'],
    stock: 200,
    specifications: [
      { name: 'Material', value: '90% Nylon, 10% Spandex' },
      { name: 'Sizes', value: 'XS, S, M, L, XL' }
    ],
    rating: { average: 4.7, count: 145 }
  },
  {
    name: 'Baseball Cap',
    description: 'Adjustable baseball cap for men.',
    price: 14.99,
    category: 'apparel',
    images: ['/assets/products/apparel/baseball-cap.jpeg'],
    stock: 300,
    specifications: [
      { name: 'Material', value: '100% Cotton' },
      { name: 'Sizes', value: 'One size fits all' }
    ],
    rating: { average: 4.5, count: 123 }
  },
  // Accessories Category
  {
    name: 'Mini Resistance Bands',
    description: 'Set of mini loop resistance bands for legs, glutes, and core workouts.',
    price: 19.99,
    category: 'accessories',
    images: ['/assets/products/accessories/mini-bands.jpeg'],
    stock: 400,
    specifications: [
      { name: 'Resistance Levels', value: 'Light, Medium, Heavy' },
      { name: 'Material', value: 'Natural latex' },
      { name: 'Size', value: '12 inch circumference' }
    ],
    rating: { average: 4.7, count: 467 }
  },
  {
    name: 'Pro Gym Bag',
    description: 'Premium gym bag with dedicated shoe compartment, wet pocket, and multiple organization compartments.',
    price: 49.99,
    category: 'accessories',
    images: ['/assets/products/accessories/gym-bag-pro.jpeg'],
    stock: 150,
    specifications: [
      { name: 'Capacity', value: '45L' },
      { name: 'Material', value: 'Water-resistant nylon' },
      { name: 'Features', value: 'Shoe compartment, wet pocket, laptop sleeve' }
    ],
    rating: { average: 4.8, count: 298 }
  },
  {
    name: 'Hand Grip',
    description: 'Professional adjustable hand grip strengthener for forearm and grip training.',
    price: 19.99,
    category: 'accessories',
    images: ['/assets/products/accessories/hand-grip.jpeg'],
    stock: 300,
    specifications: [
      { name: 'Resistance', value: '10-40kg adjustable' },
      { name: 'Material', value: 'Steel with comfort grips' },
      { name: 'Features', value: 'Counter display, Non-slip handles' }
    ],
    rating: { average: 4.6, count: 256 }
  },
  {
    name: 'Exercise Ball',
    description: 'Inflatable exercise ball for core training.',
    price: 29.99,
    category: 'accessories',
    images: ['/assets/products/accessories/exercise-ball.jpeg'],
    stock: 200,
    specifications: [
      { name: 'Material', value: 'PVC' },
      { name: 'Size', value: '65cm' }
    ],
    rating: { average: 4.5, count: 123 }
  },
  {
    name: 'Resistance Tube',
    description: 'Portable resistance tube for strength training.',
    price: 14.99,
    category: 'accessories',
    images: ['/assets/products/accessories/resistance-tube.jpeg'],
    stock: 300,
    specifications: [
      { name: 'Material', value: 'Latex' },
      { name: 'Resistance Levels', value: 'Light, Medium, Heavy' }
    ],
    rating: { average: 4.5, count: 145 }
  },
  {
    name: 'Gym Gloves',
    description: 'Weightlifting gloves for grip and protection.',
    price: 19.99,
    category: 'accessories',
    images: ['/assets/products/accessories/gym-gloves.jpeg'],
    stock: 250,
    specifications: [
      { name: 'Material', value: 'Synthetic leather' },
      { name: 'Sizes', value: 'S, M, L, XL' }
    ],
    rating: { average: 4.5, count: 123 }
  },
  {
    name: 'Water Bottle',
    description: 'Insulated water bottle for staying hydrated.',
    price: 24.99,
    category: 'accessories',
    images: ['/assets/products/accessories/water-bottle.jpeg'],
    stock: 200,
    specifications: [
      { name: 'Material', value: 'Stainless steel' },
      { name: 'Capacity', value: '27oz' }
    ],
    rating: { average: 4.6, count: 145 }
  },
  {
    name: 'Yoga Mat',
    description: 'Eco-friendly yoga mat for grip and comfort.',
    price: 29.99,
    category: 'accessories',
    images: ['/assets/products/accessories/yoga-mat.jpeg'],
    stock: 250,
    specifications: [
      { name: 'Material', value: 'PVC' },
      { name: 'Thickness', value: '4mm' }
    ],
    rating: { average: 4.6, count: 123 }
  },
  {
    name: 'Boxing Gloves',
    description: 'Professional grade boxing gloves for training and sparring.',
    price: 49.99,
    category: 'accessories',
    images: ['/assets/products/accessories/boxing-gloves.jpeg'],
    stock: 100,
    specifications: [
      { name: 'Weight', value: '12oz, 14oz, 16oz' },
      { name: 'Material', value: 'Genuine leather' },
      { name: 'Features', value: 'Wrist support, Moisture-wicking lining' }
    ],
    rating: { average: 4.8, count: 234 }
  },
  {
    name: 'Lifting Belt Pro',
    description: 'Professional grade leather weightlifting belt for maximum support and safety.',
    price: 59.99,
    category: 'accessories',
    images: ['/assets/products/accessories/lifting-belt.jpeg'],
    stock: 100,
    specifications: [
      { name: 'Material', value: 'Premium leather' },
      { name: 'Width', value: '4 inches' },
      { name: 'Features', value: 'Double prong buckle, Contoured design' }
    ],
    rating: { average: 4.9, count: 289 }
  },
  {
    name: 'Heart Rate Monitor',
    description: 'Wireless heart rate monitor for tracking fitness.',
    price: 49.99,
    category: 'accessories',
    images: ['/assets/products/accessories/heart-rate-monitor.jpeg'],
    stock: 150,
    specifications: [
      { name: 'Material', value: 'Plastic' },
      { name: 'Battery Life', value: '12 months' }
    ],
    rating: { average: 4.5, count: 145 }
  }
];

const generateProducts = () => {
  const products = [...baseProducts];
  
  // Generate more products for each category
  const categories = ['equipment', 'supplements', 'apparel', 'accessories'];

  categories.forEach(category => {
    const categoryProducts = products.filter(p => p.category === category);
    if (categoryProducts.length < 10) {
      const needed = 10 - categoryProducts.length;
      categoryProducts.forEach(baseProduct => {
        for (let i = 0; i < Math.ceil(needed / categoryProducts.length); i++) {
          products.push({
            ...baseProduct,
            name: `${baseProduct.name} v${i + 2}`,
            rating: {
              average: Number((4 + Math.random()).toFixed(1)), // Random rating between 4.0-5.0
              count: Math.floor(100 + Math.random() * 500) // Random review count
            },
            stock: Math.floor(50 + Math.random() * 200) // Random stock
          });
        }
      });
    }
  });

  return products;
};

const products = generateProducts();

const seedDatabase = async () => {
  try {
    let mongoUri = process.env.NODE_ENV === 'production' ? process.env.MONGO_URL : process.env.MONGO_TEST;
    if (!mongoUri) {
      throw new Error('MongoDB connection URI is not defined');
    }
    
    // Fix case sensitivity issue in database name
    if (mongoUri.includes('mongodb://') || mongoUri.includes('mongodb+srv://')) {
      // Extract the database name from the URI
      const dbNameMatch = mongoUri.match(/\/([^/\?]+)(\?|$)/);
      if (dbNameMatch && dbNameMatch[1]) {
        const dbName = dbNameMatch[1];
        // Replace the database name with the correct case
        mongoUri = mongoUri.replace(`/${dbName}`, '/Fitness');
        console.log('Adjusted MongoDB URI to use correct database name case');
      }
    }
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert new products
    const result = await Product.insertMany(products);
    console.log(`Successfully seeded ${result.length} products`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};



seedDatabase();
