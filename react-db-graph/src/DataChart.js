// DataChart.js
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { Chart } from 'chart.js';
import 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import { format } from 'date-fns';

Chart.register({ id: 'line', options: {}, controller: 'line' });

const DataChart = () => {
    const [chartData, setChartData] = useState({
      labels: [],
      datasets: [
        {
          label: 'Data',
          data: [],
          fill: false,
          borderColor: 'rgba(75,192,192,1)',
          tension: 0.1,
        },
      ],
    });
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get('https://pv-test.onrender.com/api/fauna_survey');
          const data = response.data;
          console.log(data); //log data

          // Fetch organism data for all unique faunaIDs
          const faunaIDs = Array.from(new Set(data.map((item) => item.faunaID)));
          const organismResponse = await axios.get('https://pv-test.onrender.com/api/organism');
          const organismData = organismResponse.data.filter((organism) =>
            faunaIDs.includes(organism.orgID)
          );

          const organismMap = organismData.reduce((map, organism) => {
            map[organism.orgID] = organism.Common_Name;
            return map;
          }, {});

          // Create an object to store the population count of each animal on each survey date
          const populationCount = {};
          data.forEach((item) => {
            const date = format(new Date(item.Survey_Date), 'yyyy-MM-dd');
            const animalName = organismMap[item.faunaID] || 'Unknown';
            populationCount[date] = populationCount[date] || {};
            populationCount[date][animalName] = (populationCount[date][animalName] || 0) + 1;
          });

          // Use the top 5 animals based on the most recent survey dates
          const sortedDates = Object.keys(populationCount).sort((a, b) => new Date(b) - new Date(a));
          const top5Dates = sortedDates.slice(0, 5);

          const labels = Object.keys(populationCount);
          const datasets = Object.keys(organismMap).map((faunaID) => ({
            label: organismMap[faunaID],
            data: labels.map((date) => populationCount[date][organismMap[faunaID]] || 0),
          }));
          

          //all organisms
          /*
          
           // Fetch organism data to get animal names
          const organismResponse = await axios.get('https://pv-test.onrender.com/api/organism');
          const organismData = organismResponse.data;
          console.log(organismData); //log data
          
          const organismMap = organismData.reduce((map, organism) => {
            map[organism.orgID] = organism.Common_Name;
            return map;
          }, {});
      
          const valueCounts = data.reduce((counts, item) => {
            const date = format(new Date(item.Survey_Date), 'yyyy-MM-dd');
            const animalName = organismMap[item.faunaID] || 'Unknown';
            counts[date] = counts[date] || {};
            counts[date][animalName] = (counts[date][animalName] || 0) + 1;
            return counts;
          }, {});
      
          const labels = Object.keys(valueCounts);
          const datasets = Object.keys(organismMap).map((faunaID) => ({
            label: organismMap[faunaID],
            data: labels.map((date) => valueCounts[date][organismMap[faunaID]] || 0),
          }));
          */
      
          const updatedChartData = {
            ...chartData,
            labels,
            datasets,
          };
          
  
          setChartData(updatedChartData);
          console.log(updatedChartData); //log data
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
  
      if (chartData.labels.length === 0) {
        fetchData();
      }
    }, [chartData]);
  
    return (
      <div>
        <h2>Fauna Survey Data</h2>
        <Line data={chartData} />
      </div>
    );
  };
  
  export default DataChart;
