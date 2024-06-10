const Product = require('../models/Product'); // Import your Product model
const listTransactions=async (req, res) => {
  try {
    const { month, search = '', page = 1, perPage = 10 } = req.query;

    const query = {};

    // Check if the month parameter is provided and valid
    if (month) {
      const monthIndex = new Date(Date.parse(`${month} 1, 2021`)).getMonth();
      if (isNaN(monthIndex)) {
        return res.status(400).send('Invalid month parameter');
      }


      const start = new Date(2021, monthIndex, 1);
      const end = new Date(2021, monthIndex + 1, 1);

      // Add dateOfSale filter to the query
      query.dateOfSale = { $gte: start, $lt: end };
    }

    // Add search filter to the query
    const searchConditions = [];
    if (search.trim()) {
      searchConditions.push({ title: { $regex: search, $options: 'i' } });
      searchConditions.push({ description: { $regex: search, $options: 'i' } });
      if (!isNaN(Number(search))) {
        searchConditions.push({ price: Number(search) });
      }
      query.$or = searchConditions;
    }

    // Fetch transactions from the database
    const transactions = await Product.find(query)
      .skip((page - 1) * perPage)
      .limit(parseInt(perPage));

    // Get total count for pagination
    const total = await Product.countDocuments(query);
    const totalPages=Math.ceil(total/perPage);
    parseInt(perPage);
    parseInt(page);


    // Send response
    res.json(transactions,total, page, perPage,totalPages);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).send('Error fetching transactions');
  }
};







const getStatistics = async (req, res) => {
  try {
    const { month } = req.query;
    const start = new Date(`2021-${month}-01`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const totalSaleAmount = await Product.aggregate([
      { $match: { dateOfSale: { $gte: start, $lt: end }, sold: true } },
      { $group: { _id: null, total: { $sum: '$price' } } },
    ]);

    const totalSoldItems = await Product.countDocuments({ dateOfSale: { $gte: start, $lt: end }, sold: true });
    const totalNotSoldItems = await Product.countDocuments({ dateOfSale: { $gte: start, $lt: end }, sold: false });

    res.json({
      totalSaleAmount: totalSaleAmount[0] ? totalSaleAmount[0].total : 0,
      totalSoldItems,
      totalNotSoldItems,
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).send('Error fetching statistics');
  }
};

const getBarChart = async (req, res) => {
  try {
    const { month } = req.query;
    const start = new Date(`2021-${month}-01`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const priceRanges = await Product.aggregate([
      { $match: { dateOfSale: { $gte: start, $lt: end } } },
      {
        $bucket: {
          groupBy: '$price',
          boundaries: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, Infinity],
          default: 'Other',
          output: {
            count: { $sum: 1 },
          },
        },
      },
    ]);

    res.json(priceRanges);
  } catch (error) {
    console.error('Error fetching bar chart data:', error);
    res.status(500).send('Error fetching bar chart data');
  }
};


const getPieChart = async (req, res) => {
  try {
    const { month } = req.query;
    const start = new Date(`2021-${month}-01`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const categoryCounts = await Product.aggregate([
      { $match: { dateOfSale: { $gte: start, $lt: end } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    res.json(categoryCounts);
  } catch (error) {
    console.error('Error fetching pie chart data:', error);
    res.status(500).send('Error fetching pie chart data');
  }
};



const getCombinedData = async (req, res) => {
  try {
    const transactionsPromise = listTransactions(req, res);
    const statisticsPromise = getStatistics(req, res);
    const barChartPromise = getBarChart(req, res);
    const pieChartPromise = getPieChart(req, res);

    const [transactions, statistics, barChartData, pieChartData] = await Promise.all([
      transactionsPromise,
      statisticsPromise,
      barChartPromise,
      pieChartPromise,
    ]);

    res.json({
      transactions,
      statistics,
      barChartData,
      pieChartData,
    });
  } catch (error) {
    console.error('Error fetching combined data:', error);
    res.status(500).send('Error fetching combined data');
  }
};


// Function to handle adding a new product
const addProduct = async (req, res) => {
  try {
    const { id, title, price, image, description, category, sold, dateOfSale } = req.body;
    
    // Check for required fields
    if (!id || !title || !price || !image) {
      return res.status(400).send('Missing required fields: id, title, price, image');
    }

    const newProduct = new Product({
      id,
      title,
      price,
      image,
      description,
      category,
      sold,
      dateOfSale,
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).send('Error adding product');
  }
};

module.exports = {
  listTransactions,
  getStatistics,
  getBarChart,
  getPieChart,
  getCombinedData,
  addProduct,
};
