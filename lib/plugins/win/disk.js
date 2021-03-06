/*
 * statistics for disk devices
 */
//TODO for i in devices.
//Only watching where git-bash and the agent are running , should be extended by using something like
//https://github.com/resin-io-modules/drivelist
var ChildProcess = require('child_process');
var diskusage = require('diskusage');

function disk() {
  this.data = initrow();
}

function initrow() {
  return {
    total: initdisk()
  };
}

function initdisk() {
  return {
    read: {
      count: 0,
      sector: 0,
      time: 0
    },
    write: {
      count: 0,
      sector: 0,
      time: 0
    }
  };
}

disk.prototype.get = function(nstat, callback) {
  var self = this;
  var data = self.data;
  commandGetDisks='wmic logicaldisk get caption';
  ChildProcess.exec( commandGetDisks, function( err, stdout, stderr) {
    if (err || stderr) {
      return callback( err || stderr.toString() );
    }
    else {
      stdout = stdout.toString().split("\n").slice(1, -2);
      stdout.forEach( function (dev){
        drive=dev.replace(/\r+/g, "");
        diskusage.check(drive, function(err, info) {
          if(undefined !== info){
            var total = initdisk();
            total.usage = {
              total: 0,
              used: 0,
              available: 0
            };
            total.usage.total += info.total;
            total.usage.used += (info.total-info.available);
            total.usage.available += info.available;
            data[drive] = total;
          }
        });

      });
      callback(null, data);
    }
  });
};

module.exports = new disk();
