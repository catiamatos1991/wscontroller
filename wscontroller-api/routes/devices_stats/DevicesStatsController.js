'use strict';
var async = require("async");

function DevicesStatsController() {
    DevicesStatsController.prototype.setRoutes = function (express) {
        var router = express.Router();

        router.route('/')
                .get(this.getAllDevicesStats);
        return router;
    };
}


DevicesStatsController.prototype.getAllDevicesStats = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getAllDevicesStats', 'inicio');
    return Database.DevicesStats.getDevicesStats().then(function (devices) {
        if (devices.length == 0) {
            res.status(404).end();
        } else {
            res.status(200).send(devices);
        }
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getAllDevicesStats', e);
        res.status(500).send(e);
    });
}


module.exports = new DevicesStatsController();
