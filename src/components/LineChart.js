import React from 'react';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';

import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineChart = ( { displayData, dataTitle  } ) => {
    const chartData = {
        labels: ['Jun', 'Jul', 'Aug'],
        datasets: [
          {
            id: 1,
            label: 'data1',
            data: [5, 6, 7],
          },
          {
            id: 2,
            label: 'data2',
            data: [137, 123, 111],
          },
        ],
    }

    const options2 = {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
        },
          title: {
            display: true,
            text: 'Temperature',
          },
        },
        scales: {
            y: {
                beginAtZero: true,
            }
        }
    };

    const chartData2 = {
        labels: ['Jun', 'Jul', 'Aug'],
        datasets: [
          {
            label: 'data1',
            data: [5, 6, 7],
            borderColor: 'green',
            backgroundColor: 'lightgreen',
            borderWidth: 1.5,
          },
          {
            label: 'data2',
            data: [137, 124, 151],
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
            borderWidth: 1.5,
           },
        ],
    }


    return (
        <div>
            <Line
            options={options2}
            data={chartData2} />
        </div>
    )
}

export default LineChart;