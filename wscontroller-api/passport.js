module.exports = function (passport) {
    var opts = {};
    opts.secretOrKey = 'Wav3sy5!';
    opts.jwtFromRequest = extractJwt.fromAuthHeader();

    passport.use(new jwtStrategy(opts, function(jwtPayload, done) {        
        Database.Users.getUserById(jwtPayload.id).then(function (user) {
            if (user) {
                done(null, user);
            } else {
                done(null, false);  
            };   
        }).catch(function (e) {
            return done(e, false);
        });
    }));
};