'use strict';

function TestesController() {}

//create routes
TestesController.prototype.setRoutes = function (express) {
    var router = express.Router();

    router.route('/gps').get(this.getGps);
    router.route('/interface').get(this.getInterface);
    router.route('/interface').get(this.getInterface);

  return router;
}

TestesController.prototype.getGps = function (req, res, next) {
    res.status(200).send({last_gps_msg:0,sats_expired:10,magnetic:"",true_track:"",date:"",elivation:"",age:68780,longitude:"-8.6110489",sats_in_view:3,km_per_hour:"",sats_active:0,knots:"",gps_valid:0,latitude:"40.6634104",sats_bad_snr:3,sats_good_snr:0} );
}

TestesController.prototype.getInterface = function (req, res, next) {
    res.status(200).send(["wlan0","lte1", "eth0", "eth1", "eth2", "br-lan"]);
}

module.exports = new TestesController();