const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.post('/getProduct', (req, res) => {
  const { code } = req.body;

  const productsDB = {
    HB203: { code: 'HB203', name: 'Milk 1L', price: 52 },
    HB204: { code: 'HB204', name: 'Bread', price: 30 },
    H3205: { code: 'HB205', name: 'Eggs (6)', price: 45 },
  };

  const product = productsDB[code];
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
