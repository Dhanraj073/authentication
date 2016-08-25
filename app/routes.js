// Import dependencies
const passport = require('passport');
const express = require('express');
const config = require('../config/main');
const jwt = require('jsonwebtoken');
const uuid =require('uuid');
const moment =require('moment')

// Set up middleware
const requireAuth = passport.authenticate('jwt', { session: false });

// Load models
const User = require('./models/user');
const TokenSchema = require('./models/chat');

// Export the routes for our app to use
module.exports = function(app) {
  // API Route Section

  // Initialize passport for use
  app.use(passport.initialize());

  // Bring in defined Passport Strategy
  require('../config/passport')(passport);

  // Create API group routes
  const apiRoutes = express.Router();

  // Register new users
  apiRoutes.post('/register', function(req, res) {
    if(!req.body.email || !req.body.password) {
      res.status(400).json({ success: false, message: 'Please enter email and password.' });
    } else {
      const newUser = new User({
        email: req.body.email,
        password: req.body.password
      });

      // Attempt to save the user
      newUser.save(function(err) {
        console.log(err);
        if (err) {
          return res.status(400).json({ success: false, message: 'That email address already exists.'});
        }
        res.status(201).json({ success: true, message: 'Successfully created new user.' });
      });
    }
  });

 
   // Authenticate the user and get a JSON Web Token to include in the header of future requests.
  apiRoutes.post('/authenticate', function(req, res) 
  {
      User.findOne({email: req.body.email}, function(err, user)
      {
          console.log(err);
          if (err) 
          throw err;
          if (!user) 
          {
              res.status(401).json({ success: false, message: 'Authentication failed. User not found.' });
          }
          else 
          {
        // Check if password matches
              user.comparePassword(req.body.password, function(err, isMatch) 
              {
                  if (isMatch && !err) 
                  {
                    // Create token if the password matched and no error was thrown
                      var temp =uuid.v4();
                      var temp2 =uuid.v4();
                      console.log(temp,temp2);
                      var token1 = jwt.sign(temp, config.secret);
                      var token2 =jwt.sign(temp2,config.secret);
                     
                      var time1 =moment(moment().format()).add(300,'seconds').format();
                      var time2 =moment(moment().format()).add(6000,'second').format();

                      console.log(token1,token2,time1,time2);

                      //console.log(time1);
                      const token = new TokenSchema({
                        email : req.body.email,
                        accessToken : token1,
                        refreshToken :token2,
                        expire1 :time1,
                        expire2 :time2
                      });
                      TokenSchema.findOne({email : token.email},function(err,user){
                          
                          if(user){
                            user.accessToken = token1 ,
                            user.refreshToken = token2 ,
                            user.expire1 = time1 ,
                            user.expire2 = time2;
                            console.log("finfdonenenenenen",user," ",token);

                            user.save(function(err){
                              if(err){
                                console.log("error at duplicate",err);
                              }
                              res.status(200).json({ success: true, token: token1  , token2 : token2 , time :time1 ,time2 : time2 });
                              
                            });

                          }
                          else if(!user){
                              token.save(function(err) 
                              {
                                  console.log(err,"user not found");
                                  if (err) 
                                  return res.status(400).json({ success: false, message: 'Database not connected...entry denied.'});
                                  res.status(200).json({ success: true, token: token1  , token2 : token2 , time :time1 ,time2 : time2 });
                              });
                          }
                      });
                      
                      
                  } 
                  else 
                  {
                      res.status(401).json({ success: false, message: 'Authentication failed. Passwords did not match.' });
                  }
              });
          }
      });
  });

  apiRoutes.get('/login',function(req,res){
    res.send("you have been sent to login page");
  })

  apiRoutes.get('/index',function(req,res){
    res.send("You have successfully logged in");
  });

  //making a custom request to home or index page


  apiRoutes.get('/home',passport.authenticate('custom',{failureRedirect :'/api/login' ,successRedirect : '/api/index'}),function(req,res){
    res.redirect('/api/index');
  });


  
   apiRoutes.get('/dashboard', passport.authenticate('jwt', { session: false }), function(req,res)
  {
  res.send('It worked! User id is: ' + req.user._id + '.');
});




  // Set url for API group routes
  app.use('/api', apiRoutes);
};
