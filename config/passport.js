const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const User = mongoose.model('users');
const keys = require('../config/keys');
// load all the things we need
//var LocalStrategy    = require('passport-local').Strategy;
//var FacebookStrategy = require('passport-facebook').Strategy;


const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;

module.exports = passport => {
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      User.findById(jwt_payload.id)
        .then(user => {
          if (user) {
            return done(null, user);
          }
          return done(null, false);
        })
        .catch(err => console.log(err));
    })
  );


  // // Passport Facebook
  //
  // // used to serialize the user for the session
  // passport.serializeUser((user, done) => {
  //     done(null, user.id);
  // });
  //
  // // used to deserialize the user
  // passport.deserializeUser((id, done) => {
  //     User.findById(id, (err, user) => {
  //         done(err, user);
  //     });
  // });
  //
  //
  // // =========================================================================
  // // FACEBOOK ================================================================
  // // =========================================================================
  // passport.use(new FacebookStrategy({
  //
  //     // pull in our app id and secret from our auth.js file
  //     clientID        : keys.facebookAuth.clientID,
  //     clientSecret    : keys.facebookAuth.clientSecret,
  //     callbackURL     : keys.facebookAuth.callbackURL
  //
  // },
  //
  // // facebook will send back the token and profile
  // (token, refreshToken, profile, done) => {
  //
  //     // asynchronous
  //     process.nextTick(() => {
  //
  //         // find the user in the database based on their facebook email
  //         User.findOne({ 'facebook.id' : profile.id }, (err, user) => {
  //
  //             // if there is an error, stop everything and return that
  //             // ie an error connecting to the database
  //             if (err)
  //                 return done(err);
  //
  //             // if the user is found, then log them in
  //             if (user) {
  //                 return done(null, user); // user found, return that user
  //             } else {
  //                 // if there is no user found with that facebook id, create them
  //                 var newUser = new User();
  //
  //                 // set all of the facebook information in our user model
  //                 newUser.facebook.id    = profile.id;
  //                 newUser.facebook.token = token; // we will save the token that facebook provides to the user
  //                 newUser.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
  //                 newUser.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
  //
  //                 // save our user to the database
  //                 newUser.save((err) => {
  //                     if (err)
  //                         throw err;
  //
  //                     // if successful, return the new user
  //                     return done(null, newUser);
  //                 });
  //             }
  //
  //         });
  //     });
  //
  // }));


};
