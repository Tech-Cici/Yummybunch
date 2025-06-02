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

const svgImages = {
  home: {
    'food-delivery.jpg': `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><rect width='300' height='200' fill='#f0f0f0'/><text x='50%' y='50%' font-family='Arial' font-size='24' fill='#666' text-anchor='middle' dominant-baseline='middle'>Food Delivery</text></svg>`
  },
  restaurant: {
    'restaurant-1.jpg': `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><rect width='300' height='200' fill='#f0f0f0'/><text x='50%' y='50%' font-family='Arial' font-size='24' fill='#666' text-anchor='middle' dominant-baseline='middle'>Restaurant 1</text></svg>`,
    'restaurant-2.jpg': `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><rect width='300' height='200' fill='#f0f0f0'/><text x='50%' y='50%' font-family='Arial' font-size='24' fill='#666' text-anchor='middle' dominant-baseline='middle'>Restaurant 2</text></svg>`,
    'restaurant-3.jpg': `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><rect width='300' height='200' fill='#f0f0f0'/><text x='50%' y='50%' font-family='Arial' font-size='24' fill='#666' text-anchor='middle' dominant-baseline='middle'>Restaurant 3</text></svg>`,
    'restaurant-4.jpg': `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><rect width='300' height='200' fill='#f0f0f0'/><text x='50%' y='50%' font-family='Arial' font-size='24' fill='#666' text-anchor='middle' dominant-baseline='middle'>Restaurant 4</text></svg>`,
    'restaurant-5.jpg': `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><rect width='300' height='200' fill='#f0f0f0'/><text x='50%' y='50%' font-family='Arial' font-size='24' fill='#666' text-anchor='middle' dominant-baseline='middle'>Restaurant 5</text></svg>`,
    'restaurant-6.jpg': `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><rect width='300' height='200' fill='#f0f0f0'/><text x='50%' y='50%' font-family='Arial' font-size='24' fill='#666' text-anchor='middle' dominant-baseline='middle'>Restaurant 6</text></svg>`,
    'restaurant-7.jpg': `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><rect width='300' height='200' fill='#f0f0f0'/><text x='50%' y='50%' font-family='Arial' font-size='24' fill='#666' text-anchor='middle' dominant-baseline='middle'>Restaurant 7</text></svg>`,
    'restaurant-8.jpg': `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><rect width='300' height='200' fill='#f0f0f0'/><text x='50%' y='50%' font-family='Arial' font-size='24' fill='#666' text-anchor='middle' dominant-baseline='middle'>Restaurant 8</text></svg>`
  },
  menu: {
    'margherita-pizza.jpg': `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><rect width='300' height='200' fill='#f0f0f0'/><text x='50%' y='50%' font-family='Arial' font-size='24' fill='#666' text-anchor='middle' dominant-baseline='middle'>Margherita Pizza</text></svg>`,
    'pepperoni-pizza.jpg': `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><rect width='300' height='200' fill='#f0f0f0'/><text x='50%' y='50%' font-family='Arial' font-size='24' fill='#666' text-anchor='middle' dominant-baseline='middle'>Pepperoni Pizza</text></svg>`,
    'veggie-pizza.jpg': `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><rect width='300' height='200' fill='#f0f0f0'/><text x='50%' y='50%' font-family='Arial' font-size='24' fill='#666' text-anchor='middle' dominant-baseline='middle'>Veggie Pizza</text></svg>`,
    'spaghetti-bolognese.jpg': `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><rect width='300' height='200' fill='#f0f0f0'/><text x='50%' y='50%' font-family='Arial' font-size='24' fill='#666' text-anchor='middle' dominant-baseline='middle'>Spaghetti Bolognese</text></svg>`,
    'fettuccine-alfredo.jpg': `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><rect width='300' height='200' fill='#f0f0f0'/><text x='50%' y='50%' font-family='Arial' font-size='24' fill='#666' text-anchor='middle' dominant-baseline='middle'>Fettuccine Alfredo</text></svg>`,
    'garlic-bread.jpg': `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><rect width='300' height='200' fill='#f0f0f0'/><text x='50%' y='50%' font-family='Arial' font-size='24' fill='#666' text-anchor='middle' dominant-baseline='middle'>Garlic Bread</text></svg>`,
    'caesar-salad.jpg': `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><rect width='300' height='200' fill='#f0f0f0'/><text x='50%' y='50%' font-family='Arial' font-size='24' fill='#666' text-anchor='middle' dominant-baseline='middle'>Caesar Salad</text></svg>`,
    'soft-drinks.jpg': `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><rect width='300' height='200' fill='#f0f0f0'/><text x='50%' y='50%' font-family='Arial' font-size='24' fill='#666' text-anchor='middle' dominant-baseline='middle'>Soft Drinks</text></svg>`,
    'bottled-water.jpg': `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><rect width='300' height='200' fill='#f0f0f0'/><text x='50%' y='50%' font-family='Arial' font-size='24' fill='#666' text-anchor='middle' dominant-baseline='middle'>Bottled Water</text></svg>`
  },
  avatar: {
    'restaurant-owner.jpg': `<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><circle cx='50' cy='50' r='50' fill='#f0f0f0'/><text x='50%' y='50%' font-family='Arial' font-size='12' fill='#666' text-anchor='middle' dominant-baseline='middle'>Restaurant Owner</text></svg>`
  }
};

function copyImages() {
  const baseDir = path.join(__dirname, '..', 'public', 'images');

  // Create directories if they don't exist
  for (const category of Object.keys(categories)) {
    const dir = path.join(baseDir, category);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // Copy SVG images to their respective directories
  for (const [category, images] of Object.entries(svgImages)) {
    for (const [filename, svg] of Object.entries(images)) {
      const filePath = path.join(baseDir, category, filename);
      fs.writeFileSync(filePath, svg);
      console.log(`Created: ${filePath}`);
    }
  }
}

copyImages(); 