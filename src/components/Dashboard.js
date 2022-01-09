import React from "react";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useRef, useEffect, useState } from "react";
import io from "socket.io-client";
import { createTheme, ThemeProvider, styled } from "@mui/material/styles";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Badge from "@mui/material/Badge";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListSubheader from "@mui/material/ListSubheader";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import LayersIcon from "@mui/icons-material/Layers";

import LineChart from "./LineChart";
import { mainListItems } from "./listitems";

const server_settings = require('../server_settings.json');
const local_ip_address = require('../local_ip_address.json')

const lightTheme = createTheme({
  palette: {
    mode: "light",
  },
});

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

const DashboardContent = () => {
  const [open, setOpen] = React.useState(true);
  const toggleDrawer = () => {
    setOpen(!open);
  };

  const [updateDashboard, setUpdateDashboard] = useState(false);

  const dataRef = useRef({
    nodesName: [],
    currentNode: "",
    nodesData: {},
  });

  const nodeNameAppBar = function setPageNode(pageNodeName) {
    console.log("set node to " + pageNodeName);
    dataRef.current.currentNode = pageNodeName;
    setUpdateDashboard((state) => !state);
  };

  const maxItems = 50;

  useEffect(() => {
    
    const socket = io("http://" + local_ip_address.address + ":" + server_settings.port.toString(), {
      transports: ["websocket", "polling"],
    });

    socket.on('connect', (data) => {
      socket.emit('identity', 'ui');
    });

    socket.on("node_data", (node) => {
      console.log(node);
      let newNodeAdded = false;
      if (dataRef.current.nodesName.indexOf(node.Name) === -1) {
        // first data received for node.Name, create dataRef.current.nodesData[node.Name]
        var sigData = [];
        for (let ii in node.Data) {
          sigData.push({
            labels: [
              node.Data[ii].Timestamp.replace(" +00:00", "")
                .split(" ")
                .reverse(),
            ],
            datasets: [
              {
                id: 1,
                label: node.Data[ii].Name,
                data: [node.Data[ii].Value],
                borderColor: "rgb(53, 162, 235)",
                backgroundColor: "rgba(53, 162, 235, 0.5)",
              },
            ],
          });
        }
        dataRef.current.nodesName.push(node.Name);
        dataRef.current.nodesData[node.Name] = sigData;
        newNodeAdded = true;
      } else {
        // append data and restrict data to maxItems
        // TODO: RESTRICT TO MaxItems
        for (let ii in node.Data) {
          var tmpSig = dataRef.current.nodesData[node.Name].find(
            (x) => x.datasets[0].label === node.Data[ii].Name
          );
          if (tmpSig !== undefined) {
            if (tmpSig.labels.length >= maxItems) {
              tmpSig.labels.shift();
              tmpSig.datasets[0].data.shift();
            }
            tmpSig.labels.push(
              node.Data[ii].Timestamp.replace(" +00:00", "")
                .split(" ")
                .reverse()
            );
            tmpSig.datasets[0].data.push(node.Data[ii].Value);
          } else {
            // this should not happen but useful to indicate error.
            console.log(
              "signal " +
                node.Data[ii].name +
                " not found in Node " +
                node.Name +
                " cannot add data"
            );
          }
        }
      }

      if (dataRef.current.currentNode.length === 0) {
        nodeNameAppBar(node.Name);
        // dataRef.current.currentNode = node.Name;
        // //setUpdateDashboard(!updateDashboard);
        // setUpdateDashboard(state => !state);
      } else if (newNodeAdded === true) {
        //setUpdateDashboard(!updateDashboard);
        setUpdateDashboard((state) => !state);
      } else {
        setUpdateDashboard((state) => !state);
      }
    });
    // CLEAN UP THE EFFECT
    return () => socket.disconnect();
  }, []);

  return (
    <ThemeProvider theme={lightTheme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar position="absolute" open={open}>
          <Toolbar
            sx={{
              pr: "24px", // keep right padding when drawer closed
            }}
          >
            <IconButton
              edge="start"
              aria-label="open drawer"
              color='inherit'
              onClick={toggleDrawer}
              sx={{
                marginRight: "36px",
                ...(open && { display: "none" }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              PLAN IAQ Portal
            </Typography>
            <Typography variant="h7" component="div" sx={{ flexGrow: 1 }}>
              {dataRef.current.currentNode}
            </Typography>
            <IconButton color="inherit">
              <Badge
                badgeContent={dataRef.current.nodesName.length}
                color="secondary"
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={open}>
          <Toolbar
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              px: [1],
            }}
          >
            <IconButton onClick={toggleDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          <Divider />
          <List>
            <ListItem>
              <ListItemText primary='Nodes'
              primaryTypographyProps={{fontSize: '20px'}}               
              sx = {{
                color: 'primary.main',
              }}
              />
            </ListItem>
            {dataRef.current.nodesName.map((element, index) => (
              <div key={index}>
                <ListItem button onClick={() => nodeNameAppBar(element)}>
                  <ListItemIcon>
                    <LayersIcon />
                  </ListItemIcon>
                  <ListItemText primary={element} />
                </ListItem>
              </div>
            ))}
          </List>
          <Divider />
          {/* <List>{secondaryListItems}</List> */}
        </Drawer>
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === "light"
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: "100vh",
            overflow: "auto",
          }}
        >
          <Toolbar />

          {dataRef.current.currentNode.length > 0 ? (
            <Container maxwidth="lg" sx={{ mt: 4, mb: 4 }}>
              <Grid container spacing={4}>
                {dataRef.current.nodesData[dataRef.current.currentNode].map(
                  (element, index) => (
                    <Grid item xs={12} key={index}>
                      <Paper
                        elevation={9}
                        sx={{
                          p: 1,
                          display: "flex",
                          flexDirection: "column",
                          height: 350,
                        }}
                      >
                        <LineChart
                          displayData={
                            dataRef.current.nodesData[
                              dataRef.current.currentNode
                            ][index]
                          }
                        />
                      </Paper>
                    </Grid>
                  )
                )}
              </Grid>
            </Container>
          ) : (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              sx={{ height: "100%", Width: "100%" }}
            >
              <Paper>
                <Typography
                  variant="h6"
                  color="inherit"
                  noWrap
                  sx={{
                    p: 4,
                  }}
                >
                  Waiting for data...
                </Typography>
              </Paper>
            </Box>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default function Dashboard() {
  return <DashboardContent />;
}
