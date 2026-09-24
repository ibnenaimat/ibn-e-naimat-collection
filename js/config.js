/**
 * Ibn e Naimat Collection - Central Configuration
 * Easily update business details, WhatsApp contact number, and store settings here.
 */

const CONFIG = {
  // Store Details
  storeName: "Ibn e Naimat Collection",
  tagline: "Original Branded Watches, Pure Honey Nuts, Gadgets & Luxury Gifts",
  
  // WhatsApp Configuration (Requirement: 03302241340)
  whatsapp: {
    number: "03302241340",              // Local display format
    international: "923302241340",       // Format required for wa.me URL
    displayNumber: "+92 330 2241340",    // Beautifully spaced display format
    
    // Default greeting messages
    defaultOrderMessage: function(product) {
      return `Assalam-o-Alaikum Ibn e Naimat Collection!\n\n` +
             `I want to order this item:\n\n` +
             `Product: ${product.name}\n` +
             `Code: ${product.id}\n` +
             `Category: ${product.categoryName}\n` +
             `Price: Rs. ${product.price.toLocaleString('en-PK')}\n\n` +
             `Please share order confirmation and advance payment details.`;
    },
    
    defaultInquiryMessage: function() {
      return `Assalam-o-Alaikum Ibn e Naimat Collection!\n\n` +
             `I would like to inquire about your available products and delivery.`;
    }
  },

  // Currency & Location Settings
  currency: {
    symbol: "Rs.",
    code: "PKR",
    format: function(amount) {
      return `Rs. ${amount.toLocaleString('en-PK')}`;
    }
  },

  // Delivery & Business Terms
  delivery: {
    coverage: "Nationwide Delivery Across All Cities of Pakistan",
    orderPolicy: "Direct confirmation via WhatsApp with advance payment",
    cities: ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala", "Hyderabad"]
  },

  // Contact Info
  contact: {
    email: "contact@ibnenaimat.com",
    phone: "03302241340",
    timing: "Monday – Sunday: 10:00 AM – 11:00 PM",
    supportNote: "Fast response on WhatsApp"
  }
};

// Export to window for vanilla JS access
window.CONFIG = CONFIG;
