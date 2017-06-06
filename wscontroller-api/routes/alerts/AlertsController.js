'use strict';

function AlertsController() {}

//create routes
AlertsController.prototype.setRoutes = function (express) {
    var router = express.Router();

    router.route('/:uuid')
            .put(passport.authenticate('jwt', {session: false}), this.updateAlert);

    return router;
}

/**
 * @api {put} /api/alerts/:id Update Alert
 * @apiVersion 0.1.0
 * @apiName PutAlert
 * @apiGroup Alerts
 * 
 * @apiParam {Object} data Alert data.
 * 
 * @apiExample Example usage
 * curl -X PUT http://localhost/api/alerts/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
 * 
 */
AlertsController.prototype.updateAlert = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateAlert', 'inicio');
    if (!validator.isUUID(req.params.uuid)) {
        res.status(400).send({error: errorMessage.invalidUuid});
        return;
    }

    var dataDb = Models.Alerts.parseData(req.body);

    Database.Alerts.updateAlertById(req.params.uuid, dataDb).then(function (alerts) {
        res.status(204).end();
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateAlert', e);
        res.status(500).send(e);
    });

}

module.exports = new AlertsController();