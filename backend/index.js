const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');
const axios=require('axios')
const Product = require('./models/Product');

const app = express();
const PORT = 8001;
app.use(cors());
app.use(express.json());
app.use('/api/products', productRoutes);

// Connection
mongoose.connect('mongodb://127.0.0.1:27017/products', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');

  // Fetch data from URL
  return axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
})
.then(response => {
  const productData = response.data;
  console.log(productData);

  // Iterate over each product in the fetched data
  const productPromises = productData.map(item => {
    const product = new Product({
      id: item.id,
      title: item.title,
      price: item.price,
      description: item.description,
      category: item.category,
      image: item.image,
      sold: item.sold || false, // Use the 'sold' field from the data or default to false
      dateOfSale: item.dateOfSale ? new Date(item.dateOfSale) : null // Use the 'dateOfSale' field if available
    });

    return product.save().catch(error => {
      if (error.code === 11000) {
        console.error(`Duplicate key error for product with id: ${item.id}`);
      } else {
        console.error(`Error inserting product with id: ${item.id}`, error);
      }
    });
  });

  return Promise.all(productPromises);
})
.then(() => {
  console.log('Products inserted');

  // Start the server only after the products are inserted
  app.listen(8001, () => console.log(`Server is started at port ${PORT}`));
})
.catch(err => {
  if (err.response && err.response.status === 404) {
    console.error('Resource not found:', err.response.status);
  } else {
    console.error('Error', err);
  }
});