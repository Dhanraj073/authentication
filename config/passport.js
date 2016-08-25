const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../app/models/user');
const config = require('../config/main');
const jwt = require('jsonwebtoken');
var moment = require('moment');
const TokenSchema = require('../app/models/chat');
var uuid =require('uuid');


var CustomStrategy =require('passport-custom').Strategy;
// Setup work and export for the JWT passport strategy
module.exports = function(passport) {
/*
    var Request  = ExtractJwt.fromAuthHeader();
    //var temp1 = Request.split(";");
    //console.log(temp1);
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeader(),
    secretOrKey: config.secret
  };*/
  //console.log(opts.jwtFromRequest,opts.secretOrKey,opts);

  passport.use(new CustomStrategy(function(req,done) 
  {
      console.log("In token strategy");
      TokenSchema.findOne({accessToken : req.headers.token1 ,refreshToken :req.headers.token2},function(err,user){
          console.log("user is found",user);
          if(err)
          return done(err,false);
          if(user)
          {

              var timePresent = moment().format();
              console.log(timePresent , user.expire1 > timePresent ,user.expire2 > timePresent);
              if(user.expire1 < timePresent && user.expire2 < timePresent){
                 //// have to redirect to authenticate
                 console.log("1");
                 done(null,false);
              }
             
              // give new access token and complete request with previous token
              else if(user.expire1 < timePresent && user.expire2 >= timePresent){
                ///
                console.log("2");
                var temp1= uuid.v4();
                var token1 = jwt.sign(temp1, config.secret);
                var time1 =moment(moment().format()).add(300,'seconds').format();
                console.log(token1,time1);
                user.accessToken =token1;
                user.expire1 =time1;

                user.save(function(err){
                  console.log("error at updating the token",err);
                });
                done(null,user);
              }
              else if(user.expire1 >=timePresent)
              {
                //complete the request......
                console.log("3");
                done(null,user);
              }
              else
              done(null,false);
          }
          else
          {
              // redirect to signupr
              done(null,false);
          }
      });
    //res.status(200).json({token1: req.headers.val1,token2:req.headers.val2});
    /*User.findOne({id: jwt_payload.id}, function(err, user) {
      if (err) {
        return done(err, false);
      }
      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    });*/
  }));

  passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});
};
