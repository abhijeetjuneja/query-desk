// defining a mongoose schema 
// including the module
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
// declare schema object.
var Schema = mongoose.Schema;

//Declare ticket model
var ticketSchema = new Schema({

    userId           : {type:String,required:true},
	userName         : {type:String,default:'',required:true},
	email            : {type:String,default:'',required:true},
	mobileNumber     : {type:String,default:'',required:true},
	queryTitle       : {type:String,default:'',required:true},
    queryDepartment  : {type:String,default:'',required:true},
    queryBody        : {type:String,default:'',required:true},
    ticketStatus     : {type:String,default:'Open'},
    comments         : [{
                            userName:String,
                            commentText:String,
                            createdAt:{type:Date,default:Date.now()}
                        }],
    createdAt        : {type:Date,default:Date.now()},
    modifiedAt       : {type:Date,default:Date.now()},
    views            : {type:Number,default:0}

});


mongoose.model('Ticket',ticketSchema);

