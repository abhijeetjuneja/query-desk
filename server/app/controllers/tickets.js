var mongoose = require('mongoose');
var express = require('express');
var app         = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
mongoose.Promise = require('bluebird');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var ticketRouter  = express.Router();
var ticketModel = mongoose.model('Ticket');
var jwt = require('jsonwebtoken');
var secret = 'aaaabd1625!@@@*jdndrvrpNSJNSD12J@HU3SN';
var responseGenerator = require('./../../libs/responseGenerator');
var detail = require('./../../middlewares/getDetails');
var resetMailer = require('./../../libs/resetMailer');

//Export controller function
module.exports.controllerFunction = function(app) {

    //Create a ticket
    ticketRouter.post('/create',function(req,res){

        //Verify body parameters
        if(req.body.queryTitle!=undefined && req.body.queryBody!=undefined && req.body.queryDepartment!=undefined ){



            var newTicket = new ticketModel({
                userId              : req.body.userId,
                userName            : req.body.userName,
                email               : req.body.email,
                mobileNumber        : req.body.mobileNumber,
                queryTitle          : req.body.queryTitle,
                queryBody           : req.body.queryBody,
                queryDepartment     : req.body.queryDepartment, 
                createdAt           : Date.now(),
                modifiedAt          : Date.now()


            });// end new ticket 

            //Save ticket
            newTicket.save(function(err,newTicket){
                if(err){
                        if(err.errors!=null)
                        { 
                            //Check if error in query title
                            if(err.errors.queryTitle){
                                var myResponse = responseGenerator.generate(true,err.errors.queryTitle.message,err.code,null);
                                console.log(myResponse);
                                res.json(myResponse);
                            }else 
                            //Check if error in query body
                            if(err.errors.queryBody){
                                var myResponse = responseGenerator.generate(true,err.errors.queryBody.message,err.code,null);
                                console.log(myResponse);
                                res.json(myResponse);
                            }
                        }
                        else {

                                var myResponse = responseGenerator.generate(true,err.errmsg,err.code,null);
                                console.log(myResponse);
                                res.json(myResponse);
                        } 
                        
                    }
                //Ticket created
                else{
                    var myResponse = responseGenerator.generate(false,"Ticket created Successfully",200,null,newTicket);
                    console.log(myResponse);
                    res.json(myResponse);
                }

            });//end new ticket save


        }
        //Fields not filled up
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
        

    });//end create ticket


    //Delete ticket by id
    ticketRouter.post('/delete/:ticketId',function(req,res){
        
        //Remove ticket
        ticketModel.remove({'_id':req.params.ticketId},function(err,ticket){
            if(err){
                var myResponse = responseGenerator.generate(true,err.message,err.code,null,null);
                console.log(myResponse);
                res.json(myResponse);
             }
            else
            {
                var myResponse = responseGenerator.generate(false,"Successfully deleted ticket",200,null,null);
                console.log(myResponse);
                res.json(myResponse);
            }
        });//end remove


    });//end delete ticket


    //Get all tickets
    ticketRouter.get('/all',function(req,res){

        //begin ticket find
        ticketModel.find({},function(err,allTickets){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error",err.code,null,null);          
                res.json( {myResponse});
            }
            else{
                if(allTickets == null || allTickets == undefined || allTickets.length == 0)
                {
                    var myResponse = responseGenerator.generate(false,"No tickets found",200,null,null);
                    console.log(myResponse);
                    res.json(myResponse);
                }
                else
                {
                    var myResponse = responseGenerator.generate(false,"Fetched tickets",200,null,allTickets);
                    console.log(myResponse);
                    res.json(myResponse);
                }         
            }

        });//end ticket model find 

    });//end get all tickets


    //Get ticket by id
    ticketRouter.get('/view/:ticketId',function(req,res){

        //begin ticket find
        ticketModel.findOne({'_id':req.params.ticketId},function(err,ticket){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error",err.code,null,null);          
                res.json( {myResponse});
            }
            else{
                //If ticket not found
                if(ticket == null || ticket == undefined)
                {
                    var myResponse = responseGenerator.generate(false,"No tickets found",200,null,null);
                    console.log(myResponse);
                    res.json(myResponse);
                }
                else
                {
                    //Update number of views and save model
                    ticket.views=ticket.views+1;
                    ticket.save(function(err,ticket){
                        if(err){
                            var myResponse = responseGenerator.generate(true,err.message,err.code,null,null);
                            console.log(myResponse);        
                        }
                        else{
                            var myResponse = responseGenerator.generate(false,"Updated number of views",200,null,null);
                            console.log(myResponse);
                        }

                    });

                    //If successfully found return response
                    var myResponse = responseGenerator.generate(false,"Fetched tickets",200,null,ticket);
                    console.log(myResponse);
                    res.json(myResponse);
                }                     
            }

        });//end ticket model find 

    });//end get ticket by id


    //Event emitter for email notification
    eventEmitter.on('commentEmail',function(data){
        if(data.to != data.from){
            var text='Hello '+data.name+'! Someone just posted an answer on your Query.Please click on the link below to view the answer - http://localhost:8080/query';
            var html='Hello '+data.name+'! Someone just posted an answer on your Query.Please click on the link below to view the answer - <a href="http://localhost:8080/query/'+data.id+'">http://localhost:8080/query/</a>';
            
            //Send email about answer notification
            resetMailer.send('Localhost',data.to,'Answer Notification',text,html);
        }
    });

    //Event emitter for ticket status change notification
    eventEmitter.on('statusEmail',function(data){
        var text='Hello '+data.name+'! Your ticket status has changed to '+data.status+'.Please click on the link below to view the answer - http://localhost:8080/query';
        var html='Hello '+data.name+'! Your ticket status has changed to '+data.status+'.Please click on the link below to view the answer - <a href="http://localhost:8080/query/'+data.id+'">http://localhost:8080/query/</a>';
        
        //Send email about ticket status
        resetMailer.send('Localhost',data.to,'Ticket Status changed',text,html);
    });


    //Post a comment on ticket by ticket Id
    ticketRouter.post('/comment/:ticketId',function(req,res){

        //Get name and answer from body        
        var name=req.body.userName;
        var text=req.body.answer;
        var emailSend=req.body.sendEmail;

        //begin ticket find
        ticketModel.findOne({'_id':req.params.ticketId},function(err,ticket){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error",err.code,null,null);      
                console.log(myResponse);   
                res.json( {myResponse});
            }
            else{
                //If ticket not found
                if(ticket == null || ticket == undefined)
                {
                    var myResponse = responseGenerator.generate(false,"No tickets found",200,null,null);
                    console.log(myResponse);
                    res.json(myResponse);
                }
                //If ticket found
                else
                {
                    var myResponse = responseGenerator.generate(false,"Fetched tickets",200,null,ticket);
                    console.log(myResponse);

                    //Push the comment in comments array in ticket model
                    ticket.comments.push({userName:name,commentText:text});
                    //Save ticket
                    ticket.save(function(err,ticket){
                        if(err){
                            var myResponse = responseGenerator.generate(true,err.message,err.code,null,null);
                            console.log(myResponse);
                            res.json(myResponse);         
                        }
                        else{
                            //Get details for email notification
                            var details = {from:name,to:ticket.email,name:ticket.userName,id:ticket._id};

                            //Emit email notification event
                            if(emailSend)
                            eventEmitter.emit('commentEmail',details);
                            var myResponse = responseGenerator.generate(false,"Comment created Successfully",200,null,null);
                            console.log(myResponse);
                            res.json(myResponse);
                        }

                    });//end ticket save
                }         
               

            }

        });//end ticket model find 

    });//end comment post


    //Change status of ticket
    ticketRouter.put('/changeStatus/:ticketId',function(req,res){

        //Get new status
        var newStatus = {ticketStatus : req.body.ticketStatus}

        //begin ticket find and update
        ticketModel.findOneAndUpdate({'_id':req.params.ticketId},newStatus,function(err,ticket){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error",err.code,null,null);      
                console.log(myResponse);   
                res.json( {myResponse});
            }
            else{
                //If ticket not found
                if(ticket == null || ticket == undefined)
                {
                    var myResponse = responseGenerator.generate(false,"No tickets found",200,null,null);
                    console.log(myResponse);
                    res.json(myResponse);
                }
                //If ticket found
                else
                {
                    //Get details for email notification
                    var details = {to:ticket.email,status:newStatus.ticketStatus,id:ticket._id,name:ticket.userName};

                    //Emit email notification event
                    eventEmitter.emit('statusEmail',details);
                    var myResponse = responseGenerator.generate(false,"Ticket Status changed",200,null,null);
                    console.log(myResponse);
                    res.json(myResponse);
                }                        
            }

        });//end ticket model find 

    });//end ticket status change    


    //name api
    app.use('/ticket', ticketRouter);



 
};//end contoller code
