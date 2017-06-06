'use strict';


function DevicesStatsDatabase() {}

DevicesStatsDatabase.prototype.getDevicesStats = function () {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getDevicesStats', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbStatsConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getDevicesStats', err);
                reject(err);
                return
            }
            client.query('SELECT * FROM devices', [], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getDevicesStats', err);
                    reject(err);
                } else {
					console.log('>>>>>>>>>>>>>>>>>>>>>');
					console.log('>>>>>>>>>>>>>>>>>>>>>');
					console.log('>>>>>>>>>>>>>>>>>>>>>');
					console.log('result.rows',result.rows);
					console.log('>>>>>>>>>>>>>>>>>>>>>');
					console.log('>>>>>>>>>>>>>>>>>>>>>');
					console.log('>>>>>>>>>>>>>>>>>>>>>');

                    resolve(result.rows);
                }
            });
        });
    });
}


module.exports = new DevicesStatsDatabase();