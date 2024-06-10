import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TransactionsTable from './components/TransactionsTable';
import Statistics from './components/Statistics';
import BarChart from './components/BarChart';
import PieChart from './components/PieChart';
import './styles.css';

const App = () => {
  const [month, setMonth] = useState('March');
  const [search, setSearch] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [barChartData, setBarChartData] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);
  const [page, setPage] = useState(1);

  const fetchTransactions=async (search = '', page = 1, perPage = 10, month = '') => {
    try {
      const response = await axios.get('http://localhost:8001/api/products/transactions', {
        params: { search, page, perPage, month }
      });
      setTransactions(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };


  const fetchStatistics = async () => {
    try {
      const response = await axios.get('http://localhost:8001/api/products/statistics', { params: { month } });
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchBarChartData = async () => {
    try {
      const response = await axios.get('http://localhost:8001/api/products/bar-chart', { params: { month } });
      setBarChartData(response.data);
    } catch (error) {
      console.error('Error fetching bar chart data:', error);
    }
  };

  const fetchPieChartData = async () => {
    try {
      const response = await axios.get('http://localhost:8001/api/products/pie-chart', { params: { month } });
      setPieChartData(response.data);
    } catch (error) {
      console.error('Error fetching pie chart data:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchStatistics();
    fetchBarChartData();
    fetchPieChartData();
  }, [month, search, page]);

  useEffect(() => {
    setPage(1);
  }, [month, search, page]);

  return (
    <div className="app-container">
      <h1>Transaction Dashboard</h1>
      <div className="controls">
        <label>Select Month: </label>
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search transactions"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <TransactionsTable transactions={transactions} setPage={setPage} />
      <Statistics statistics={statistics} />
      <BarChart data={barChartData} />
      <PieChart data={pieChartData} />
    </div>
  );
};

export default App;


