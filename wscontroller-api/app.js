//Init global 
require('./globals');

//Global variables
var app         = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(function (err, req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, '['+ new Date() +'] '+err.status+' '+req.method+' '+req.path+' '+err.message+' body '+JSON.stringify(req.body));
  res.status(err.status || 500);
  res.send({"error": err.message});
});
app.use(function(req, res, next) {
  createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, '['+ new Date() +'] '+res.statusCode+' '+req.method+' '+req.path+' body '+JSON.stringify(req.body));  
  next();
});

app.use(passport.initialize());

var listRoutDirectories = getDirectories(routeDirectory);
for (var i = 0; i < listRoutDirectories.length; i++) {
  var directoryName = listRoutDirectories[i];
  var directoryPath = routeDirectory+'/'+listRoutDirectories[i];
  var directoryFiles = getFiles(directoryPath);

  for (var j = 0; j < directoryFiles.length; j++) {
    var file = directoryFiles[j];
    if (file.indexOf('Controller.js') > -1) {
      global.Controllers[file.replace('Controller.js', '')] = require(directoryPath+'/'+file);
      //setRoutes of Controller
      app.use('/'+directoryName,  global.Controllers[file.replace('Controller.js', '')].setRoutes(express));
    }else if (file.indexOf('Model.js') > -1) {
      global.Models[file.replace('Model.js', '')] = require(directoryPath+'/'+file);
    }else if (file.indexOf('Database.js') > -1) {
      global.Database[file.replace('Database.js', '')] = require(directoryPath+'/'+file);
    }
  }  
}

require('./passport')(passport);

//Start server
app.listen(serverPort, function (params) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'API server listening...');
});