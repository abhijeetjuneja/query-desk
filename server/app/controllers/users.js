var mongoose = require('mongoose');
var express = require('express');
mongoose.Promise = require('bluebird');

// express router // used to define routes 
var userRouter  = express.Router();
var userModel = mongoose.model('User');
var jwt = require('jsonwebtoken');
var secret = 'aaaabd1625!@@@*jdndrvrpNSJNSD12J@HU3SN';
var responseGenerator = require('./../../libs/responseGenerator');
var detail = require('./../../middlewares/getDetails');
var resetMailer = require('./../../libs/resetMailer');


module.exports.controllerFunction = function(app) {


    //Get all users
    userRouter.get('/all',function(req,res){

        //begin user find
        userModel.find({}).select("email name mobileNumber").exec(function(err,allUsers){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error",err.code,null,null);          
                res.json( {myResponse});
            }
            else{
                //If no users found
                if(allUsers == null || allUsers[0] == undefined || allUsers.length == 0)
                {
                    var myResponse = responseGenerator.generate(false,"No users found",200,null,allUsers);
                    console.log(myResponse);
                    res.json(myResponse);
                }
                //If users found
                else
                {
                    var myResponse = responseGenerator.generate(false,"Fetched Users",200,null,allUsers);
                    console.log(myResponse);
                    res.json(myResponse);
                }         
               

            }

        });//end user model find 

    });//end get all users


    //Signup
    userRouter.post('/signup',function(req,res){

        //Verify body parameters
        if(req.body.name!=undefined && req.body.email!=undefined && req.body.password!=undefined && req.body.mobile !=undefined){

            var newUser = new userModel({
                name                : req.body.name,
                email               : req.body.email,
                mobileNumber        : req.body.mobile,
                password            : req.body.password


            });// end new user 

            //Save user
            newUser.save(function(err,newUser){
                if(err){
                    if(err.errors!=null)
                    { 
                        //Check if name is valid
                        if(err.errors.name){
                            var myResponse = responseGenerator.generate(true,err.errors.name.message,err.code,null,null);
                            console.log(myResponse);
                            res.json(myResponse);
                        } else
                        //Check if email is valid 
                        if(err.errors.email){
                            var myResponse = responseGenerator.generate(true,err.errors.email.message,err.code,null,null);
                            console.log(myResponse);
                            res.json(myResponse);
                        } else 
                        //Check if mobile number is valid
                        if(err.errors.mobileNumber){
                            var myResponse = responseGenerator.generate(true,err.errors.mobileNumber.message,err.code,null,null);
                            console.log(myResponse);
                            res.json(myResponse);
                        }
                        //Check if password is valid
                          else if(err.errors.password){
                            var myResponse = responseGenerator.generate(true,err.errors.password.message,err.code,null,null);
                            console.log(myResponse);
                            res.json(myResponse);
                        }
                    }
                    else if(err){
                        //If error code 11000 duplicate email
                        if(err.code==11000){
                            var myResponse = responseGenerator.generate(true,'Email already exists',err.code,null,null);
                            console.log(myResponse);
                            res.json(myResponse);
                        }
                        else{
                            var myResponse = responseGenerator.generate(true,err.errmsg,err.code,null,null);
                            console.log(myResponse);
                            res.json(myResponse);
                        } 
                        
                    }
                    
                    

                }
                //If no errors
                else{
                    //Sign JWT Token
                    var token = jwt.sign({email:newUser.email, name : newUser.name , mobile : newUser.mobileNumber,userId:newUser._id},secret,{expiresIn:'24h'});
                    
                    var myResponse = responseGenerator.generate(false,"Signup Up Successfully",200,token,null);
                    console.log(myResponse);
                    res.json(myResponse);
                }

            });//end new user save


        }
        //Form fields not filled up
        else{
            var myResponse = {
                error: true,
                message: "Please fill up all the fields",
                status: 403,
                data: null
            };

            //res.send(myResponse);
            console.log(myResponse);
            res.json(myResponse);

        }
        

    });//end signup



    //Login
    userRouter.post('/login',function(req,res){

        //begin user find
        userModel.findOne({'email':req.body.email}).select('email password name mobileNumber').exec(function(err,foundUser){
            if(err){
                var myResponse = responseGenerator.generate(true,"Some error occurred",err.code,null,null);
                console.log(myResponse);
                //res.send(myResponse);
                res.json(myResponse);

            }
            //If user not found
            else if(foundUser==null || foundUser==undefined || foundUser.email == undefined){

                var myResponse = responseGenerator.generate(true,"Could not authenticate user",404,null,null);
                console.log(myResponse.message);
                //res.send(myResponse);
                res.json(myResponse);

            }
            else
            {
                //Check if password exists
                if(req.body.password){
                    console.log(req.body.password);

                    //Decrypt and compare password the Database
                    var validPassword = foundUser.comparePassword(req.body.password);
                }
                //No password provided 
                else {
                    var myResponse = responseGenerator.generate(true,"No password provided",404,null,null);
                    console.log(myResponse);
                    res.json(myResponse); 
                }
                //If password doesn't match
                if(!validPassword)
                {
                    var myResponse = responseGenerator.generate(true,"Could not authenticate password.Invalid password",404,null,null);
                    console.log(myResponse);
                    res.json(myResponse); 
                }
                //If password matches
                else
                {
                    //Sign JWT token
                    var token = jwt.sign({email:foundUser.email, name : foundUser.name , mobile : foundUser.mobileNumber,userId:foundUser._id},secret,{expiresIn:'24h'});
                    
                    var myResponse = responseGenerator.generate(false,"Login Successfull",200,token,null);
                    console.log(myResponse);
                    res.json(myResponse); 
                }

            }
        });
    });


    //Delete user by id
    userRouter.post('/delete/:ticketId',function(req,res){
        
        //Remove ticket
        userModel.remove({'_id':req.params.ticketId},function(err,user){
            if(err){
                var myResponse = responseGenerator.generate(true,err.message,err.code,null,null);
                console.log(myResponse);
                res.json(myResponse);
             }
            else
            {
                var myResponse = responseGenerator.generate(false,"Successfully deleted user",200,null,null);
                console.log(myResponse);
                res.json(myResponse);
            }
        });//end remove


    });//end delete ticket


    //Check if email already exists
    userRouter.post('/checkemail',function(req,res){

        //begin user find
        userModel.findOne({'email':req.body.email}).select('email').exec(function(err,foundUser){
            if(err){
                var myResponse = responseGenerator.generate(true,"Some error occurred",err.code,null,null);
                console.log(myResponse);
                //res.send(myResponse);
                res.json(myResponse);

            }
            //If user not found
            else if(foundUser==null || foundUser==undefined || foundUser.email == undefined){

                var myResponse = responseGenerator.generate(false,"Email available",200,null,null);
                console.log(myResponse.message);
                //res.send(myResponse);
                res.json(myResponse);

            }
            //If user found generate error that email already exists
            else
            {
                var myResponse = responseGenerator.generate(true,"Email already taken",200,null,null);
                console.log(myResponse.message);
                //res.send(myResponse);
                res.json(myResponse);
            }
        });
    });


    //Get email for password reset and assign reset token
    userRouter.put('/resetpassword',function(req,res){

        //begin user find
        userModel.findOne({'email':req.body.email}).select('email name mobileNumber resetToken').exec(function(err,foundUser){
            if(err){
                var myResponse = responseGenerator.generate(true,"Some error occurred",err.code,null,null);
                console.log(myResponse);
                //res.send(myResponse);
                res.json(myResponse);
            }
            else
            //If email not found
            if(foundUser==null || foundUser==undefined || foundUser.email == undefined){

                var myResponse = responseGenerator.generate(true,"Email not found",400,null,null);
                console.log(myResponse.message);
                //res.send(myResponse);
                res.json(myResponse);

            }
            //If email found
            else
            {
                //Assign Reset Token
                foundUser.resetToken=jwt.sign({email:foundUser.email},secret,{expiresIn:'24h'});

                var newToken=foundUser.resetToken;

                //Save new reset token
                foundUser.save(function(err){
                    if(err){
                        var myResponse = responseGenerator.generate(true,"Some error occurred",err.code,null,null);
                        console.log(myResponse);
                        res.json(myResponse);
                    }
                    else{
                        //Details for email notification
                        var text='Hello '+foundUser.name+'! You recently requested to change your password.Please click on the link below to change your password - http://localhost:3000/#newpassword/'+newToken;
                        var html='Hello '+foundUser.name+'! You recently requested to change your password.Please click on the link below to change your password - <a href="http://localhost:3000/resetpassword/' + newToken+'">http://localhost:3000/reset/</a>';
                        
                        //Send email with password reset link
                        resetMailer.send('Localhost',foundUser.email,'Reset Password Link',text,html);
                        var myResponse = responseGenerator.generate(false,"Check email for password change link",200,null,null);
                        console.log(myResponse.message);
                        res.json(myResponse);
                    }

                });

            }
        });

     });//end reset password


    //Reset Password by reset Token
    userRouter.get('/resetpassword/:token',function(req,res){

        //begin user find by reset token
        userModel.findOne({'resetToken':req.params.token}).select().exec(function(err,foundUser){
            if(err){
                var myResponse = responseGenerator.generate(true,"Some error occurred",err.code,null,null);
                console.log(myResponse);
                //res.send(myResponse);
                res.json(myResponse);

            }
            //Get token
            var token = req.params.token;

            //Verify reset token with secret
            jwt.verify(token,secret,function(err,decoded){
                if(err){
                    var myResponse = responseGenerator.generate(true,"Password link has expired",err.code,null,null);
                    console.log(myResponse);
                    res.json(myResponse);
                }
                else{
                    //If user not found password link expired
                    if(foundUser == null || foundUser == undefined){
                        console.log(foundUser);
                        var myResponse = responseGenerator.generate(true,"Password link has expired",404,null,foundUser);
                        console.log(myResponse);
                        res.json(myResponse);
                    } 
                    //User found 
                    else{

                        //Send email as data in response
                        var data={email:foundUser.email};
                        var myResponse = responseGenerator.generate(false,"Success",200,null,data);
                        console.log(myResponse);
                        res.json(myResponse);
                    }
                    
                }
            });
        });
    });


    //Save new password
    userRouter.put('/savepassword',function(req,res){
        
        //Find user by email
        userModel.findOne({'email':req.body.email}).select().exec(function(err,foundUser){
            if(err){
                var myResponse = responseGenerator.generate(true,"Some error occurred",err.code,null);
                console.log(myResponse);
                res.json(myResponse);

            }
            else{
                //Set new password
                foundUser.password = req.body.password;

                //Set reset token as null
                foundUser.resetToken=null;

                //Save new model
                foundUser.save(function(){
                    if(err){
                        var myResponse = responseGenerator.generate(true,"Could not change Password",err.code,null,null);
                        console.log(myResponse);
                        res.json(myResponse);

                    } else {
                        var myResponse = responseGenerator.generate(false,"Changed Password",200,null,null);
                        console.log(myResponse);
                        res.json(myResponse);
                    }
                });
                

            }

        });// end find

    });//end save password



    //Delete user by id.Admin section
    userRouter.post('/:userId/delete',function(req,res){
        
        //Remove user
        userModel.remove({'_id':req.params.userId},function(err,user){
            if(err){
                var myResponse = responseGenerator.generate(true,"Some error.Check Id"+err,500,null,null);
                console.log(myResponse);
                res.json(myResponse);
             }
            else
            {
                var myResponse = responseGenerator.generate(false,"Successfully deleted user",200,null,null);
                console.log(myResponse);
                res.json(myResponse);
            }
        });//end remove


    });//end remove user

    //Get user details through middleware
    userRouter.post('/me',detail.getDetails,function(req,res){
        
        res.json(req.details);

    });


    //name api
    app.use('/users', userRouter);



 
};//end contoller code
