const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const categories = {
  home: ['food-delivery.jpg'],
  restaurant: Array.from({ length: 8 }, (_, i) => `restaurant-${i + 1}.jpg`),
  menu: [
    'margherita-pizza.jpg',
    'pepperoni-pizza.jpg',
    'veggie-pizza.jpg',
    'spaghetti-bolognese.jpg',
    'fettuccine-alfredo.jpg',
    'garlic-bread.jpg',
    'caesar-salad.jpg',
    'soft-drinks.jpg',
    'bottled-water.jpg'
  ],
  avatar: ['restaurant-owner.jpg']
};

async function generatePlaceholders() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Load the HTML file
  const htmlPath = path.join(__dirname, '..', 'public', 'images', 'placeholder.html');
  await page.goto(`file://${htmlPath}`);

  // Create directories if they don't exist
  for (const category of Object.keys(categories)) {
    const dir = path.join(__dirname, '..', 'public', 'images', category);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // Generate images for each category
  for (const [category, images] of Object.entries(categories)) {
    for (const image of images) {
      const selector = category === 'avatar' 
        ? '.avatar' 
        : `.image-box:nth-child(${images.indexOf(image) + 1})`;
      
      const element = await page.$(selector);
      if (element) {
        const screenshot = await element.screenshot();
        const filePath = path.join(__dirname, '..', 'public', 'images', category, image);
        fs.writeFileSync(filePath, screenshot);
        console.log(`Generated: ${filePath}`);
      }
    }
  }

  await browser.close();
  console.log('All placeholder images generated successfully!');
}

generatePlaceholders().catch(console.error); 