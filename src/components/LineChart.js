import React from "react";
import "chartjs-plugin-zoom";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import TableViewIcon from "@mui/icons-material/TableView";
import MuiTooltip from "@mui/material/Tooltip";
import { useRef } from "react";

import ShowTable from "./ShowTable";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineChart = ({ displayData }) => {
  const tableChartContRef = useRef(null);

  // if true show chart if false show data as table
  const [displayChart, setDisplayChart] = React.useState(true);

  const showChart = () => {
    setDisplayChart(true);
  };

  const showTable = () => {
    setDisplayChart(false);
  };

  const options2 = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        align: "end",
      },
      title: {
        display: false,
        text: "Temperature",
      },
      zoom: {
        enabled: true,
        mode: "x",
      },
      pan: {
        enabled: true,
        mode: "x",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
      x: {
        ticks: {
          // For a category axis, the val is the index so the lookup via getLabelForValue is needed
          callback: function (val, index) {
            return index % 5 === 0 ? this.getLabelForValue(val) : "";
          },
          maxRotation: 0,
          minRotation: 0,
        },
      },
    },
  };


  return (
    <Grid
      container
      spacing={0}
      sx={{
        height: "inherit",
      }}
    >
      <Grid item xs>
        <div></div>
      </Grid>
      <Grid item xs={1}>
        {displayChart ? (
          <MuiTooltip
            title="Show Table"
            sx={{
              mt: 0,
              mb: 0,
            }}
          >
            <IconButton color="inherit" onClick={showTable}>
              <TableViewIcon />
            </IconButton>
          </MuiTooltip>
        ) : (
          <MuiTooltip
            title="Show Chart"
            sx={{
              mt: 0,
              mb: 0,
            }}
          >
            <IconButton color="inherit" onClick={showChart}>
              <ShowChartIcon />
            </IconButton>
          </MuiTooltip>
        )}
      </Grid>
      <Grid item xs={12}>
        <Box
          sx={{
            mt: 1.5,
            display: "flex",
            alignItems: "center",
            justifyItems: "center",
            width: "100%",
            height: "95%",
          }}
          ref={tableChartContRef}
        >
          {displayChart ? (
            <Line options={options2} data={displayData} height={"100%"} />
          ) : (
            <ShowTable
              displayData={displayData}
              compHeight={tableChartContRef.current.offsetHeight}
            />
          )}
        </Box>
      </Grid>
    </Grid>
  );
};

export default LineChart;
