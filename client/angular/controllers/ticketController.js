app.controller('ticketController',['$http','userService','$location','authService','$timeout','$scope','$q','ticketService','$routeParams','$window',function($http,userService,$location,authService,$timeout,$scope,$q,ticketService,$routeParams,$window){

    var main=this;

    main.ticketStatusMessage=false;

    this.setNavbar = function(){
        $('nav').addClass('second-navbar');
    };

    main.setNavbar();

    //Initialize comments array
    this.comments=[];
    
    //Create new Ticket
    this.createTicket = function(ticketData, valid){

        //Set loading and error message
        main.loading = true;
        main.errorMessage=false;

        var main1=this;

        //Call authService to get user
        authService.getUser().then(function(data){

            //Fill up ticketdata
            main.userId=data.data.userId;
            main1.ticketData.userName = data.data.name;
            main1.ticketData.email=data.data.email;
            main1.ticketData.mobileNumber=data.data.mobile;
            main1.ticketData.userId=data.data.userId;
            if(valid){

                //Call ticket service for new ticket
                ticketService.create(main1.ticketData).then(function(data){

                    //Remove loader
                    main.loading = false;
                    if(data.data.error)
                    {
                        //set error message
                        main.errorMessage=data.data.message;
                    }
                    else
                    {
                        //Set success message and redirect to dashboard
                        main.successMessage=data.data.message + '...Redirecting';
                        $timeout(function(){
                        $location.path('/dashboard');
                        },2000);
                      
                    }
                });
            } 
            else
            {   
                //Set loading and error message
                main.loading = false;
                main.errorMessage="Please ensure the form is filled properly";
            }
          
        });

    };



    //Get Query details
    this.getQueryDetails = function(){

        //Set loading to true
        main.loading=true;

        //Save id from route params
        this.id=$routeParams.id;

        //Call ticket service to get ticket details
        ticketService.getTicketById(this.id).then(function(data){

            //Save email id and comments
            main.email = data.data.data.email;
            main.userId=data.data.data.userId;
            main.comments = data.data.data.comments;

            //Set loading to false
            main.loading = false;
            if(data.data.error)
            {
                //Set error message
                main.ticketErrorMessage=data.data.message;
            }
            else
            {
                //Set success message
                main.query=data.data.data;

                //Status
                if(main.query.ticketStatus=='Open')
                main.open=true;
                else main.close=true;                                    
            }           
        });
         
    };

    if($location.path() != '/query/create')
    //Call query details function
    main.getQueryDetails();


    //Change status of ticket
    this.changeStatus = function(status){

        this.statusData = {ticketStatus : status,ticketId:$routeParams.id};
        ticketService.changeStatus(this.statusData).then(function(data){
            if(data.data.error)
            {
                //Set message for ticket status
                main.ticketStatusMessage="Could not change Ticket Status !"; 
            }
            else
            {
                //Set message for ticket status
                main.ticketStatusMessage="Ticket Status changed !";    
                toastr.success("Ticket Status changed !") ;  
                setTimeout(function() {
                    $window.location.reload(); 
                }, 1000);
                                            
            }
        });

    };


    //Post answer
    this.postAnswer=function(answerData,valid){

        var main1=this;

        if(valid){
            //Call authservice tp get user
            authService.getUser().then(function(data){

                //Set logged user name
                main.loggedUser = data.data.name;
                if(main.userId == data.data.userId)
                    main1.answerData.sendEmail=false;
                else
                    main1.answerData.sendEmail=true;

                //Save answer data 
                main1.answerData.userName=data.data.name;
                main1.answerData.ticketId=$routeParams.id;
                
                //Call ticket service to comment
                ticketService.comment(main1.answerData).then(function(data){
                    if(data.data.error)
                    {
                        //Set message for ticket status
                        main.commentMessage="Sorry could not post answer !"; 
                    }
                    else
                    {
                        //Set message for ticket status
                        main.commentMessage="Answer posted successfully !"; 
                        // Display a success toast, with a title
                        toastr.success("Answer posted successfully !") ;
                        main.getQueryDetails();   

                        //Reset Form
                        document.getElementById("commentForm").reset();               
                    } 
                });
            });
        }
        

    };





}]);


