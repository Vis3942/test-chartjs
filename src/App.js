import React from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useRef, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';

import LineChart from './components/LineChart';
import './App.css';

const lightTheme = createTheme({ palette: { mode: 'light' } });

const StyPaper = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.palette.text.secondary,
  lineHeight: '60px',
  elevation: 10,
}));


const App = () => {

  const [updateDashboard, setUpdateDashboard] = useState(false);

  const dataRef = useRef({
    nodesName: [],
    currentNode: '',
    nodesData: {},
  });

  const nodeNameAppBar = function setPageNode( pageNodeName ) {
    console.log("set node to " + pageNodeName);
    dataRef.current.currentNode = pageNodeName;
    setUpdateDashboard(state => !state);
  }


  useEffect(() => {
    const socket = io('http://localhost:9000', {
      transports: ['websocket', 'polling']
    });

    socket.on('node_data', (node) => {
      console.log(node);
      let newNodeAdded = false;
      if (dataRef.current.nodesName.indexOf(node.Name) === -1) {
        // first data received for node.Name, create dataRef.current.nodesData[node.Name]
        var sigData = [];
        for (let ii in node.Data) {
          sigData.push( {
            labels: [node.Data[ii].Timestamp.replace(' +00:00', '')],
            datasets: [
              {
                id: 1,
                label: node.Data[ii].Name,
                data: [node.Data[ii].Value],
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
              },
            ],
          });
        }
        dataRef.current.nodesName.push(node.Name);
        dataRef.current.nodesData[node.Name] = sigData;
        newNodeAdded = true;
      }
      else {
        // append data and restrict data to maxItems
        // TODO: RESTRICT TO MaxItems
        for (let ii in node.Data) {
          var tmpSig = dataRef.current.nodesData[node.Name].find(x => x.datasets[0].label === node.Data[ii].Name);
          if (tmpSig !== undefined) {
            tmpSig.labels.push(node.Data[ii].Timestamp.replace(' +00:00', ''))
            tmpSig.datasets[0].data.push(node.Data[ii].Value)
          }
          else {
            // this should not happen but useful to indicate error.
            console.log("signal " + node.Data[ii].name + " not found in Node "+ node.Name + " cannot add data");
          }
        }
      }

      if (dataRef.current.currentNode.length === 0) {
        nodeNameAppBar(node.Name);
        // dataRef.current.currentNode = node.Name;
        // //setUpdateDashboard(!updateDashboard);
        // setUpdateDashboard(state => !state);
      }
      else if (newNodeAdded === true) {
        //setUpdateDashboard(!updateDashboard);
        setUpdateDashboard(state => !state);
      }
      else 
      {
        setUpdateDashboard(state => !state);
      }
   });
    // CLEAN UP THE EFFECT
    return () => socket.disconnect();
  }, []);

  const chartData2 = {
    labels: ['Jun', 'Jul', 'Aug'],
    datasets: [
      {
        label: 'data2',
        data: [137, 124, 151],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderWidth: 1.5,
        maintainAspectRatio: false,
       },
    ],
}


  if (dataRef.current.currentNode.length > 0)
  {
    return (
      <ThemeProvider theme={lightTheme}>
      <Container maxwidth="lg" sx={{ mt:4, mb: 4}}>
      <Grid container spacing={4}>
        {
          dataRef.current.nodesData[dataRef.current.currentNode].map( (element, index) => (
            <Grid item xs={12} key={index}>
            <StyPaper elevation={9}
              sx = {{
                p: 1,
                display: 'flex',
                flexDirection: 'column',
              }} 
            >
                <LineChart displayData={dataRef.current.nodesData[dataRef.current.currentNode][index]} />
            </StyPaper>
          </Grid>
          ))
        }

      </Grid>
    </Container>
    </ThemeProvider>
    )
  }
  else 
  {
    return (
      <ThemeProvider theme={lightTheme}>
      <Box  
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{ height: '100%', Width: '100%'}}>
        <StyPaper>
          <Typography
          variant="h6"
          color="inherit"
          noWrap
          sx = {{
            p: 4
          }}
          >
          Waiting for data...
          </Typography>
        </StyPaper>
      </Box>
      </ThemeProvider>
    )
  }
} 

export default App;
