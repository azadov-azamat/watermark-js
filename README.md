# Dynamic Watermark Application
This is a JavaScript-based watermarking solution that allows you to dynamically apply either an image or text watermark to a main image.
The position and opacity of the watermark can be customized, and if the watermark is an image, its size is adjusted relative to the main image.

## Features
- Apply either image or text watermarks.
- Supports dynamic positioning:
  - `top-left`,
  - `top-right`,
  - `center`,
  - `bottom-left`,
  - `bottom-right`.
- Adjust watermark opacity for image-based watermarks.
- Automatically resizes the watermark to fit the main image (up to 1/8th of the image width).
- Uses the Sharp library for image manipulation and the Canvas API for opacity adjustments.

## Installation
1. Ensure you have Node.js installed on your system.
2. Install the required npm packages:
   ```bash
     npm install sharp axios canvas
     ```
## Usage
To use this watermarking solution, you can call the `addDynamicWatermark` function. 
Here’s an example of how to apply a watermark to an image:
```javascript
addDynamicWatermark(
   'https://your-main-image-url.com',   // The URL of the main image
   'https://your-watermark-url.com',    // The URL of the watermark image or text for the watermark
    true,                                // Set to true if the watermark is an image, false if it's text
    'top-right',                         // Position: 'top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'
    'output-image.png'                   // The path where the watermarked image will be saved\n);
```

### Parameters:
- `imageUrl`: The URL of the main image where the watermark will be applied.
- `watermarkInput`: The URL or text that will be used as a watermark.
- If you’re using an image, this should be the image URL.
- If you’re using text, this should be the text string.
- `isImageUrl`: A boolean flag that indicates whether the watermark input is an image (`true`) or text (`false`).
- `position`: The position of the watermark. Possible values are:
- `top-left`
- `top-right`
- `center`
- `bottom-left`
- `bottom-right`
- `outputFilePath`: The file path where the watermarked image will be saved.

## Example
```javascript
addDynamicWatermark(
    'https://example.com/main-image.jpg',   // Main image URL
    'Watermark Text',                       // Text watermark
     false,                                  // Set to false for text watermark
    'center',                               // Watermark position
    'output-image.png'                      // Output file path\n);
```

### Text Watermark Example:
If you want to apply a text watermark, you can set `isImageUrl` to `false` and pass the desired text in `watermarkInput`.

### Image Watermark Example:

For image watermarks, set `isImageUrl` to `true` and provide the image URL in `watermarkInput`.

## How It Works
1. **Download the Main Image:** The main image is downloaded using `axios`.
2. **Download or Create Watermark:**
 - If the watermark is an image, it is also downloaded using `axios`.
 - If the watermark is text, an SVG is created to render the text as an overlay.
3. **Apply Opacity (For Image Watermark):** The opacity of the image watermark is set using the `Canvas` API.
4. **Resize Watermark:** The watermark is resized to ensure it doesn’t exceed 1/8th of the main image’s width.
5. **Composite the Watermark:** The watermark is applied to the main image at the specified position using the Sharp library.
6. **Save the Watermarked Image:** The final watermarked image is saved to the specified output file path.
