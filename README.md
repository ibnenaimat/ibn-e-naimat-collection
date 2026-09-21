# Ibn e Naimat Collection - E-Commerce Website

A professional, modern, and responsive e-commerce storefront for **Ibn e Naimat Collection** designed specifically for Pakistani customers.

---

## Key Features

- **Store Niches**:
  - Original Branded Watches
  - Honey Nuts / Pure Honey with Dry Fruits
  - Mobile Accessories & Gadgets
  - Luxury Gift Items
- **Direct WhatsApp Ordering**:
  - Every product card features a prominent **"Order on WhatsApp"** button.
  - Automatically opens WhatsApp with the product title, unique item code, category, and price in PKR.
  - WhatsApp number pre-configured: **03302241340**.
- **Transparent Pakistani Ordering Flow**:
  - 4-step clear process (Select -> Order on WhatsApp -> Advance Payment Confirmation -> Nationwide Courier Delivery).
  - No fake reviews, fake statistics, or misleading countdown timers.
- **Dynamic Catalog Architecture**:
  - Products and categories are stored in `js/products.js`.
  - Add, remove, or edit products and prices without modifying HTML files.
- **Fast & Responsive**:
  - Zero heavy libraries or build steps.
  - Fully responsive across mobile, tablet, and desktop screens.
  - High-resolution SVG placeholders included out of the box.

---

## File Structure

```
g:/Watch store/website data/
│
├── index.html                     # Primary HTML landing page
├── README.md                      # Documentation and guide
│
├── css/
│   ├── style.css                  # Core design system, variables, luxury styling
│   └── responsive.css             # Mobile, tablet, and desktop media queries
│
├── js/
│   ├── config.js                  # Store configuration & WhatsApp number (03302241340)
│   ├── products.js                # Product catalog & categories
│   └── app.js                     # Dynamic rendering, search, filtering & modal logic
│
└── assets/
    └── images/
        ├── logo.svg               # Primary brand logo
        ├── logo-white.svg         # White logo for dark sections
        └── placeholders/
            ├── watch-placeholder.svg
            ├── honey-nuts-placeholder.svg
            ├── gadgets-placeholder.svg
            └── gift-placeholder.svg
```

---

## How to Test and Run the Website

### Option 1: Direct File Opening
Double-click `index.html` to open it in any web browser (Chrome, Edge, Firefox, Safari).

### Option 2: Local Server (Recommended)
If you have Python installed, open PowerShell in this folder and run:
```powershell
python -m http.server 8080
```
Then visit `http://localhost:8080` in your browser.

---

## How to Customize Step by Step

### 1. Updating Store Details or WhatsApp Number
Open `js/config.js`:
```javascript
const CONFIG = {
  whatsapp: {
    number: "03302241340",              // Local display
    international: "923302241340",       // For wa.me links
    displayNumber: "+92 330 2241340",    // Spaced display
  },
  // ...
};
```

### 2. Adding or Editing Products
Open `js/products.js`. To add a new product, copy this template and paste it inside the `PRODUCTS` array:
```javascript
{
  id: "INC-W105",
  name: "Your Watch Name",
  category: "watches", // "watches", "honey-nuts", "gadgets", or "gifts"
  categoryName: "Original Branded Watches",
  price: 8500,
  badge: "New Arrival",
  image: "assets/images/your-photo.jpg", // path to your image
  shortDesc: "Brief description of the product.",
  specs: [
    "Feature 1",
    "Feature 2",
    "Feature 3"
  ],
  featured: true
}
```

### 3. Adding Real Product Photos
1. Save your photos inside `assets/images/`.
2. Update the `image` field for that item in `js/products.js` to point to your new file (e.g. `assets/images/my-watch.jpg`).
