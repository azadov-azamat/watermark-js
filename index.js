const { createCanvas, loadImage } = require('canvas');
const sharp = require('sharp');
const axios = require('axios');
const fs = require('fs');

// Convert user-friendly position to Sharp's gravity and SVG coordinates
function convertPositionToGravityAndCoordinates(position, width, height) {
    const map = {
        'top-left': { gravity: 'northwest', x: '10%', y: '10%' },
        'top-right': { gravity: 'northeast', x: '90%', y: '10%' },
        'center': { gravity: 'center', x: '50%', y: '50%' },
        'bottom-left': { gravity: 'southwest', x: '10%', y: '95%' },
        'bottom-right': { gravity: 'southeast', x: '90%', y: '95%' }
    };
    return map[position] || { gravity: 'center', x: '50%', y: '50%' };
}

async function applyOpacityToImage(imageBuffer, opacity) {
    const image = await loadImage(imageBuffer);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    ctx.globalAlpha = opacity; // Set the opacity level
    ctx.drawImage(image, 0, 0, image.width, image.height);

    return new Promise((resolve, reject) => {
        canvas.toBuffer((err, buffer) => {
            if (err) reject(err);
            else resolve(buffer);
        }, 'image/png');
    });
}

async function addDynamicWatermark(imageUrl, watermarkInput, isImageUrl, position, outputFilePath) {
    let watermarkedImage; // Bu o'zgaruvchi watermark ishlov berilgan rasmni saqlaydi

    try {
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' }).catch(e => {
            throw new Error(`Failed to download image: ${e.message}`);
        });

        const mainImage = sharp(imageResponse.data);
        const metadata = await mainImage.metadata();

        // Convert position to Sharp's gravity and coordinates for SVG
        const { gravity, x, y } = convertPositionToGravityAndCoordinates(position, metadata.width, metadata.height);
        let watermarkBuffer;

        if (isImageUrl) {
            // If the watermark is an image, download it
            const watermarkResponse = await axios.get(watermarkInput, { responseType: 'arraybuffer' }).catch(e => {
                throw new Error(`Failed to download watermark: ${e.message}`);
            });

            if (!watermarkResponse.headers['content-type'].includes('image')) {
                throw new Error('Watermark URL did not point to a valid image.');
            }

            watermarkBuffer = await applyOpacityToImage(watermarkResponse.data, 0.6);
            // let watermarkBuffer = Buffer.from(watermarkResponse.data);

            // Resize the watermark image to max 1/8 of the main image width dynamically
            const watermark = sharp(watermarkBuffer);
            const watermarkMetadata = await watermark.metadata();

            const scaleFactor = Math.min(1, metadata.width / 8 / watermarkMetadata.width); // Ensuring the watermark is no wider than 1/8 of the main image width

            watermarkBuffer = await watermark
                .resize({
                    width: Math.floor(watermarkMetadata.width * scaleFactor),
                    background: { r: 255, g: 255, b: 255, alpha: 0.9 }
                })
                .toBuffer();

            // Apply watermark to the main image
            watermarkedImage = await mainImage.composite([{
                input: watermarkBuffer,
                gravity: gravity,
                blend: 'over'
            }]).toBuffer();
        } else {
            // If the watermark is text, create an SVG
            const fontSize = 30; // Or dynamically adjust size based on image dimensions
            const watermarkBuffer = Buffer.from(
                `<svg width="${metadata.width}" height="${metadata.height}">
            <text x="${x}" y="${y}" alignment-baseline="middle" text-anchor="middle" font-family="Arial" font-size="${fontSize}" fill="white" opacity="0.5">${watermarkInput}</text>
        </svg>`
            );

            // Apply watermark to the main image
            watermarkedImage = await mainImage.composite([{
                input: watermarkBuffer,
                gravity: gravity,
                blend: 'over'
            }]).toBuffer();
        }
    } catch (error) {
        console.error('Error processing image:', error);
        return; // Xato bo'lganda funksiyani to'xtatib qo'yish
    }

    // Natijaviy watermark ishlov berilgan rasmni saqlash
    fs.writeFileSync(outputFilePath, watermarkedImage);
    console.log(`Watermarked image saved to ${outputFilePath}`);
}

// Example usage
// addDynamicWatermark(
//     'https://post-uz.s3-accelerate.amazonaws.com/properties/515/72e119af-d0de-4c2f-8429-fd55acbf2b48',   // Replace with your main image URL
//     'Real estate',    // Replace with your watermark image URL or text
//     false,                              // isImage: true for image, false for text
//     'bottom-left',                    // Position: 'top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'
//     'watermarked-image.png'   // Replace with the path where you want to save the watermarked image
// );

// Example usage
addDynamicWatermark(
    'https://post-uz.s3-accelerate.amazonaws.com/properties/515/72e119af-d0de-4c2f-8429-fd55acbf2b48',   // Replace with your main image URL
    'https://post-uz.s3-accelerate.amazonaws.com/companies/29/03365a18-3dc7-452e-9918-db71183d17af',    // Replace with your watermark image URL or text
    true,                              // isImage: true for image, false for text
    'top-right',                    // Position: 'top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'
    'watermarked-image.png'   // Replace with the path where you want to save the watermarked image
);

// Example usage
// addDynamicWatermark(
//     'https://post-uz.s3-accelerate.amazonaws.com/properties/515/72e119af-d0de-4c2f-8429-fd55acbf2b48',   // Replace with your main image URL
//     'https://post-uz.s3-accelerate.amazonaws.com/companies/31/3f3faf38-a77b-42a3-8c73-d58b7c9dcecb',    // Replace with your watermark image URL or text
//     true,                              // isImage: true for image, false for text
//     'top-right',                    // Position: 'top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'
//     'watermarked-image.png'   // Replace with the path where you want to save the watermarked image
// );
