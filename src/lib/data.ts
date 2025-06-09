
// mockProducts are no longer used as data will be fetched from Firestore.
// You need to populate your Firestore 'products' collection.
// Example product structure (ensure 'id' is the Firestore document ID):
// {
//   id: 'unique-product-id',
//   name: 'Classic Leather Wallet',
//   name_lowercase: 'classic leather wallet', // For searching
//   description: 'A timeless bifold wallet...',
//   price: 49.99,
//   imageUrl: 'https://placehold.co/400x300.png',
//   images: ['https://placehold.co/600x400.png'],
//   category: 'Accessories',
//   featured: true,
//   stock: 15,
// }

// This file can be removed or repurposed for other static data if needed.
// For now, it's kept to avoid breaking imports if it was used elsewhere for non-product data,
// but its primary purpose (mockProducts) is gone.

export {}; // Add an empty export to make it a module if it's empty.
