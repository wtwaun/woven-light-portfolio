# WILD WAUN Photography Portfolio

A clean, elegant, and fast-loading photography portfolio website.

## Features

- **Fast Performance**: Optimized for speed with lazy loading and efficient image handling
- **Category Filtering**: Browse photos by category (Wildlife, Landscape, Abstract, Cityscape, Plants, Stars)
- **Responsive Design**: Works beautifully on all devices
- **Clean UI**: Minimalist, elegant design that puts your photography front and center

## Setup Instructions

### 1. Add Your Logo

Place your logo file in the root directory and name it `logowhite.png`. The logo should include the "WILD WAUN" text as part of the design.

Supported formats: PNG, JPG, SVG
Recommended size: Height of 60px (width will scale proportionally)

### 2. Add Your Photography

Organize your images in the following folder structure:

```
images/
├── wildlife/
│   ├── 1.jpg
│   ├── 2.jpg
│   └── ...
├── landscape/
│   ├── 1.jpg
│   ├── 2.jpg
│   └── ...
├── abstract/
│   ├── 1.jpg
│   └── ...
├── cityscape/
│   ├── 1.jpg
│   └── ...
├── plants/
│   ├── 1.jpg
│   └── ...
└── stars/
    ├── 1.jpg
    └── ...
```

### 3. Update Image References

Edit `script.js` and update the `galleryImages` array with your actual image paths. Replace the placeholder entries with your real photos.

Example:
```javascript
const galleryImages = [
    { src: 'images/wildlife/your-photo.jpg', category: 'wildlife', alt: 'Description of your photo' },
    // Add more images...
];
```

### 4. Image Optimization Tips

For best performance, optimize your images before uploading:

- **Format**: Use JPEG for photos, WebP for better compression
- **Size**: Resize images to a maximum width of 1200-1600px
- **Quality**: Compress images to 80-85% quality
- **Tools**: Use tools like ImageOptim, TinyPNG, or Squoosh

### 5. Run the Website

Simply open `index.html` in a web browser, or use a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

## Customization

### Colors

Edit the CSS variables in `styles.css`:

```css
:root {
    --bg-color: #fafafa;        /* Background color */
    --text-color: #1a1a1a;      /* Text color */
    --accent-color: #2c2c2c;    /* Accent/button color */
    --border-color: #e0e0e0;    /* Border color */
}
```

### Fonts

The site uses Inter font from Google Fonts. To change it, update the font link in `index.html` and the `font-family` in `styles.css`.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

All photography and content © WILD WAUN. All rights reserved.

