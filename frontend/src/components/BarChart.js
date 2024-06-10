import { Chart, CategoryScale, ArcElement, BarElement, LineElement } from 'chart.js';
import {  registerables } from 'chart.js';
import React from 'react';
import { Bar } from 'react-chartjs-2';

const BarChart = ({ data }) => {
  Chart.register(CategoryScale, ArcElement, BarElement, LineElement);
  Chart.register(...registerables);
  const chartData = {
    labels: data.map(d => d._id),
    datasets: [
      {
        label: 'Number of Items',
        data: data.map(d => d.count),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  return (
    <div className="chart">
      <h2>Price Range Bar Chart</h2>
      <Bar data={chartData} />
    </div>
  );
};

export default BarChart;
