'use strict';
var async = require("async");

function ServicesController() {
    ServicesController.prototype.setRoutes = function (express) {
        var router = express.Router();

        router.route('/')
            .get(this.getAllDevicesServiceInterfaces);
		router.route('/updateModem/:uuid')
            .put(this.updateModem);
		router.route('/updateWifi/:uuid')
            .put(this.updateWifi);
		router.route('/updateMap/:uuid')
            .put(this.updateMap);
        return router;
    };
}

ServicesController.prototype.getAllDevicesServiceInterfaces = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getAllDevicesServiceInterfaces', 'inicio');
    return Database.Services.getServicesInterfaces().then(function (interfaces) {
		if (interfaces.length == 0) {
            res.status(404).end();
        } else {
            res.status(200).send(interfaces);
        }
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getAllDevicesServiceInterfaces', e);
        res.status(500).send(e);
    });
}

ServicesController.prototype.updateModem = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateModem', 'inicio');
	var data = req.body;

	var state;
	if(data.state=="1"){
		state=1;
	} else if(data.state=="0"){
		state=0;
	}
	createLog('debug', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateModem', 'data', data);
	createLog('debug', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateModem', 'data state', data.state);

    if (isEmptyObject(data)) {
        res.status(400).send({error: errorMessage.emptyBody});
        return;
    }

    if (data.sn === undefined || data.sn === "") {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateModem', 'Invalid serial number');
        res.status(400).send({error: "Invalid serial number"});
        return;
    }

	
    Database.Devices.getDeviceBySn(data.sn).then(function (device) {
		var ifname=data.ifname;
		return ServicesController.prototype.uci(device[0], "network", "/etc/init.d/hwman", ifname, "enabled", data.state, true, true).then(function (modemData){
			console.log('updateModem ---> data',modemData);
			if (modemData != undefined) {
				res.status(404).end();
			} else {
				console.log('updateDeviceInterface ', device[0].id, ' for ', ifname, ' to ', state);
				Database.Services.updateModemDeviceInterface(device[0].id, ifname, state);
				res.status(200).send(modemData);
			}
		}).catch(function (e) {
			createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateModem', e);
			res.status(500).send(e);
		});
	}).catch(function (e) {
			createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateWifi', e);
			res.status(500).send(e);
		});
}
		
ServicesController.prototype.updateWifi = function (req, res, next) { //this is what i call when i click on the button in the screen
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateWifi', 'inicio');
    var data = req.body;
	var state;
	if(data.state=="1"){
		state=1;
	} else if(data.state=="0"){
		state=0;
	}
    if (isEmptyObject(data)) {
        res.status(400).send({error: errorMessage.emptyBody});
        return;
    }

    if (data.sn === undefined || data.sn === "") {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateWifi', 'Invalid serial number');
        res.status(400).send({error: "Invalid serial number"});
        return;
    }

	 Database.Devices.getDeviceBySn(data.sn).then(function (device) {
		createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateWifi', 'device', device);
		createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateWifi', 'device.id', device[0].id);

		var ifname=data.ifname;
		return ServicesController.prototype.uci(device[0], "teste_wireless", "wifi", ifname, "disabled", data.state, true, true).then(function(wifiData){
			console.log('updateWifi ---> data',wifiData);
			if (wifiData != undefined) {
				res.status(404).end();
			} else {
				console.log('updateDeviceInterface ', device[0].id, ' for ', ifname, ' to ', state);
				Database.Services.updateWifiDeviceInterface(device[0].id, ifname, state);
				res.status(200).send(wifiData);
			}
		}).catch(function (e) {
			createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateWifi', e);
			res.status(500).send(e);
		});
	}).catch(function (e) {
			createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateWifi', e);
			res.status(500).send(e);
		});
}		
		
ServicesController.prototype.uci = function(device, config, path, section, opt, value, apply, commit){
    var values={opt:value};

    return Controllers.Ubus.uciRequest('set', {"config": config, "section": section, values}, device)
      .then(function (uciData) {
		createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), device.id, 'uci', 'uciData',uciData );
        var promises = [];

        if (uciData!=null) {
            createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), device.id, 'uci', 'depois do if do uciData' );

            if (commit){
                createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'uci', 'commit');
                var p1 = Controllers.Ubus.uciRequest('commit', {"config": config}, device)
                  .then(function (dataCommit) {
                    if (dataCommit && dataCommit.hasOwnProperty('result') && data.result[0] == 0) {
                      createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'uci', 'commit data', dataCommit);
                    }
                  })
              promises.push(p1);
            }

            if(apply){
                createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'uci', 'apply');
                var p2 = Controllers.Ubus.fileExec(device.id, "exec", path, "restart")
                  .then(function (dataApply) {
					if (dataApply && dataApply.hasOwnProperty('result') && data.result[0] == 0) {
                      createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'uci', 'apply data', dataApply);
                    }
                })
              promises.push(p2);
            }
        }
        return Promise.all(promises);
        //the function is going to return an array like [dataCommit, applyCommit] or [undefined, undefined] depend of the commit / apply
    })
}


ServicesController.prototype.updateMap = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateMap', 'inicio');
	createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateMap', 'req.body', req.body);

    var data = req.body;
    if (isEmptyObject(data)) {
        res.status(400).send({error: errorMessage.emptyBody});
        return;
    }

    if (data.sn === undefined || data.sn === "") {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateMap', 'Invalid serial number');
        res.status(400).send({error: "Invalid serial number"});
        return;
    }

	console.log("updateMap depois do getDeviceBySn   ---   sn >>>", data.sn);
    Database.Services.getDeviceBySn(data.sn).then(function (device) {
		console.log("updateMap depois do getDeviceBySn   ---   device >>>", device);
		console.log("updateMap depois do getDeviceBySn   ---   device id >>>", device.id);
		var map_data={
			"visible": data.visible
		}
		
		Database.Services.addMapInfo(map_data, device.id).then(function (map) {
			console.log("updateMap depois do addMapInfo   ---   map >>> ", map);
			if (map!=null) {
				res.sendStatus(200).send(map);
			} else {
				res.sendStatus(404).end();
			}
		}).catch(function (e) {
			createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateUser', 'catch bd', e);
			res.sendStatus(500).send(e);
		});
		
	}).catch(function (e) {
		createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateUser', 'get devide by id', e);
		res.sendStatus(500).send(e);
	});
}
			

module.exports = new ServicesController();
