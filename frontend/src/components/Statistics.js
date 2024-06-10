import React from 'react';

const Statistics = ({ statistics }) => {
  return (
    <div className="statistics">
      <h2>Statistics</h2>
      <div className="stat-box">
        <div>Total Sale Amount: ${statistics.totalSaleAmount}</div>
        <div>Total Sold Items: {statistics.totalSoldItems}</div>
        <div>Total Not Sold Items: {statistics.totalNotSoldItems}</div>
      </div>
    </div>
  );
};

export default Statistics;
