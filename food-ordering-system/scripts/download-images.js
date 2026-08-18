const https = require('https');
const fs = require('fs');
const path = require('path');

const images = {
  home: {
    'food-delivery.jpg': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836'
  },
  restaurant: {
    'restaurant-1.jpg': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
    'restaurant-2.jpg': 'https://images.unsplash.com/photo-1552566626-52f8b828add9',
    'restaurant-3.jpg': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
    'restaurant-4.jpg': 'https://images.unsplash.com/photo-1514933651103-005eec06c04b',
    'restaurant-5.jpg': 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c',
    'restaurant-6.jpg': 'https://images.unsplash.com/photo-1559339352-11d035aa65de',
    'restaurant-7.jpg': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
    'restaurant-8.jpg': 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c'
  },
  menu: {
    'pizza-1.jpg': 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
    'pizza-2.jpg': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002',
    'pasta-1.jpg': 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8',
    'pasta-2.jpg': 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8',
    'burger-1.jpg': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
    'burger-2.jpg': 'https://images.unsplash.com/photo-1586816001966-79b736744398',
    'drink-1.jpg': 'https://images.unsplash.com/photo-1544145945-f90425340c7e',
    'drink-2.jpg': 'https://images.unsplash.com/photo-1544145945-f90425340c7e'
  },
  avatar: {
    'restaurant-owner.jpg': 'https://images.unsplash.com/photo-1560250097-0b93528c311a'
  }
};

async function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filePath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(filePath, () => reject(err));
      });
    }).on('error', reject);
  });
}

async function downloadAllImages() {
  const baseDir = path.join(__dirname, '..', 'public', 'images');

  for (const [category, categoryImages] of Object.entries(images)) {
    const categoryDir = path.join(baseDir, category);
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }

    for (const [filename, url] of Object.entries(categoryImages)) {
      const filePath = path.join(categoryDir, filename);
      try {
        await downloadImage(url, filePath);
        console.log(`Downloaded ${filename}`);
      } catch (error) {
        console.error(`Error downloading ${filename}:`, error.message);
      }
    }
  }
}

downloadAllImages().catch(console.error); 