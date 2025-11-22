require('dotenv').config();
const { Sequelize } = require('sequelize');

// Initialize DB connection
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false
  }
);

// Import models
const Product = require('../models/Product')(sequelize);

async function seedProducts() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');
    console.log('Starting product seeding...');
    
    // Array of genres and 20 products each
    const genres = ['Viễn tưởng', 'Kinh dị', 'Công nghệ', 'Triết học', 'Lãng mạn', 'Manga'];
    const products = [];
    let productIndex = 1;
    
    genres.forEach((genre, genreIdx) => {
      for (let i = 1; i <= 20; i++) {
        const basePrice = 100000 + (productIndex * 2500);
        const discountPercent = [0, 10, 15, 20, 25][i % 5];
        const discountedPrice = basePrice - Math.floor(basePrice * discountPercent / 100);
        
        products.push({
          title: `${genre} - Tựa sách #${i}`,
          author: String.fromCharCode(65 + ((i - 1) % 20)), // A-T
          stock: 50 + (i * 2),
          originalPrice: basePrice,
          discountedPrice: discountedPrice,
          discountPercent: discountPercent,
          imageUrl: 'https://placehold.co/300x400',
          imgAlt: `Bìa ${genre} ${i}`,
          badgeText: i === 1 ? 'New' : null,
          outOfStock: false,
          rating: (3.8 + (i % 12) * 0.1).toFixed(1),
          description: `Mô tả ngắn cho ${genre} - Tựa sách #${i}`,
          category: genre,
        });
        productIndex++;
      }
    });
    
    // Bulk create products
    const created = await Product.bulkCreate(products, { 
      individualHooks: true,
      ignoreDuplicates: false 
    });
    
    console.log(`✅ Successfully seeded ${created.length} products!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error.message);
    process.exit(1);
  }
}

seedProducts();
