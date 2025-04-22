import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define source and destination directories
const sourceDir = path.join(__dirname, '../../iFitness/src/assets/images');
const destDir = path.join(__dirname, '../assets/posts');

// Create destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Function to copy files
const copyFiles = () => {
  // Read all files from source directory
  fs.readdir(sourceDir, (err, files) => {
    if (err) {
      console.error('Error reading source directory:', err);
      return;
    }

    // Filter out product and logo images
    const postImages = files.filter(file => {
      const isImage = file.match(/\.(jpg|jpeg|png|gif)$/i);
      const isNotProduct = !file.includes('products/');
      const isNotLogo = !file.includes('logo');
      return isImage && isNotProduct && isNotLogo;
    });

    // Copy each post image to destination
    postImages.forEach(file => {
      const sourcePath = path.join(sourceDir, file);
      const destPath = path.join(destDir, file);

      fs.copyFile(sourcePath, destPath, (err) => {
        if (err) {
          console.error(`Error copying ${file}:`, err);
        } else {
          console.log(`Successfully copied ${file} to posts directory`);
        }
      });
    });
  });
};

// Run the copy operation
copyFiles();
