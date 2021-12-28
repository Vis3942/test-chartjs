import React from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';

import LineChart from './components/LineChart';
import './App.css';


const App = () => {

  return (
    <Container maxwidth="lg" sx={{ mt:4, mb: 4}}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Paper
            sx = {{
              p: 1,
              display: 'flex',
              flexDirection: 'column',
            }} 
          >
            <LineChart />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper
            sx = {{
              p: 1,
              display: 'flex',
              flexDirection: 'column',
            }} 
          >
            <LineChart />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  ) 

} 

export default App;
