const fs = require('fs');
const server_settings = require('./server_settings.json');
const logLocation = server_settings.logLocation;

function RotateFilesByDate(mostRecentCount, prefix, extension) {
    fs.readdir( './' + logLocation, (err, files) => {
        if (err) {
            console.log(err);
            return;
        }
        let tmpfiles = files.filter(x => x.startsWith(prefix) && x.endsWith("." + extension))
        tmpfiles = tmpfiles.sort();
        if (tmpfiles.length > mostRecentCount) {
            for (let ii=mostRecentCount -1; ii < tmpfiles.length; ii++) {
                let tmpDelName = './' + (logLocation.endsWith("/") ? logLocation : logLocation + "/") + tmpfiles[ii];
                fs.unlink(tmpDelName, (err) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    console.log('deleted file ' + tmpDelName);
                })
            }
        }
    })
}

module.exports = { RotateFilesByDate };
