const { RotateFilesByDate }  = require('./RotateFiles');
const writeToCsv = require('./WriteToCsv');
const server_local = require('http').createServer();
const server_ui = require('http').createServer();
const server_settings = require('./server_settings.json');
const localIpV4Address = require("local-ipv4-address");
const dgram = require("dgram");
const socket = dgram.createSocket("udp4");
const fs = require('fs');
socket.bind(function () {
  socket.setBroadcast(true);
});
const os = require('os');

const io = require('socket.io')(server_local, {
    transports: ['websocket', 'polling']
});

const conn_info = {
    ui: null,
    dc: null
};
var bcastInterval = null;
var toSendInterfaces = null;
const node_times = {};


function checkBcastInterval() {
    if (conn_info.dc === null)  {
        if (bcastInterval === null) {
            bcastInterval = setInterval(bcastMessages, server_settings.intervalSecs * 1000);
        }
    }
    else {
        // console.log(bcastInterval !== null);
        // console.log(bcastInterval);
        // if (bcastInterval !== null)
        // {
            clearInterval(bcastInterval);
            // console.log(bcastInterval);
            bcastInterval = null;
            //     bcastInterval = null;
        // }
    }
}

io.on('connection', (client) => {
    console.log("New client " + client.id + " connected");

    client.on('identity', (deviceName) => {
        console.log("identity: dc conn => " + deviceName);
        if (deviceName.toLowerCase() === "dc") {
            conn_info.dc = client.id;
        }
        console.log(conn_info)
        checkBcastInterval();
    })

    client.on("node_data", (node_data) => {
        // io.sockets.emit('node_data', node_data);
        if (conn_info.ui !== null) {
            io_ui.sockets.to(conn_info.ui).emit('node_data', node_data);
        }
        writeToCsv.WriteToCsvFile(node_data);
        let tmpDate = new Date();
        let performRoateCheck = false;
        if (node_times[node_data.Name] === undefined) {
            node_times[node_data.Name] = tmpDate;
            // app just started; good to check file rotation
            performRoateCheck = true;
        } 
        else {
            if (node_times[node_data.Name].getUTCDate() !== tmpDate.getUTCDate()) {
                node_times[node_data.Name] = tmpDate;
                performRoateCheck = true;
            }
        } 
        if (performRoateCheck) {
            RotateFilesByDate(server_settings.numberOfFilesPerNode, 
                node_data.Name + "_" + server_settings.logPrefix, 
                "csv");

        }
    })

    client.on("disconnect", (reason) => {
        for(var kk in conn_info) {
            if (conn_info[kk] === client.id) {
                conn_info[kk] = null;
                console.log("device: " + kk);
                break;
            }
        }
        console.log("client " + client.id + " disconnected.");
        console.log(reason);
        checkBcastInterval();
    });

});



const serv = {
  port: server_settings.port,
  proto: 'tcp',
  addrFamily: 'IPv4',
  bonus: {
      version: server_settings.version
  },
  address: '127.0.0.1'
};
var localAddress = '127.0.0.1';
var sendMessage = '';

localIpV4Address().then(function(ipAddress){
    console.log("LAN ip address is " + ipAddress);
    server_local.listen(server_settings.port, ipAddress, () => {
        console.log(`websock server running on http://${ipAddress}:${server_settings.port}`);
    });

    // stringify JSON Object
    const jObj = {address: ipAddress};
    var jsonContent = JSON.stringify(jObj);
    console.log(jsonContent);
    
    fs.writeFile("./src/local_ip_address.json", jsonContent, 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
    
        console.log("local_ip_address.json has been created.");
    });


    serv.address = ipAddress;
    localAddress = ipAddress;
    sendMessage = JSON.stringify(serv);
    checkBcastInterval();

});


function bcastMessages() {
    if (toSendInterfaces === null)
    {
        toSendInterfaces = Object.values(os.networkInterfaces()).flat().filter((item) => !item.internal && item.family === "IPv4");
    }
    for (let tInterface of toSendInterfaces) {
        let addr_splitted = tInterface.address.split('.');
        let netmask_splitted = tInterface.netmask.split('.');
        let tmp_baddr = addr_splitted.map((e, i) => (~netmask_splitted[i] & 0xFF) | e).join('.');
        console.log(tmp_baddr);
        if (sendMessage.length <= 0) {
            const tobj = {address:  localAddress, port: server_settings.port}
            sendMessage = JSON.stringify(tobj);
        } 
        socket.send(sendMessage, 0, sendMessage.length, 41234, tmp_baddr, function(err, bytes) {
            if (err) {
                console.log(err);
            }
        });
    }
}

const io_ui = require('socket.io')(server_ui, {
    transports: [ 'websocket', 'polling']
} );


io_ui.on('connection', (client) => {
    console.log("New client " + client.id + " connected");

    client.on('identity', (deviceName) => {
        console.log("identity: ui conn => " + deviceName);
        if (deviceName.toLowerCase() === "ui")
        {
            conn_info.ui = client.id;
        }
        console.log(conn_info)
    })
});

server_ui.listen(server_settings.port+1, '127.0.0.1', () => {
    console.log(`websock server running on http://127.0.0.1:${server_settings.port+1}`);
});
