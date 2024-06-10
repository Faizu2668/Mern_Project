import React from 'react';
import { Pie } from 'react-chartjs-2';

const PieChart = ({ data }) => {
  const chartData = {
    labels: data.map(d => d._id),
    datasets: [
      {
        label: 'Categories',
        data: data.map(d => d.count),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
        ],
      },
    ],
  };

  return (
    <div className="chart">
      <h2>Category Distribution Pie Chart</h2>
      <Pie data={chartData} />
    </div>
  );
};

export default PieChart;
