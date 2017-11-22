app.controller('dashboardController',['$http','userService','$location','authService','$timeout','$scope','$q','ticketService',function($http,userService,$location,authService,$timeout,$scope,$q,ticketService){
    $scope.query={};
    var main=this;
    this.reverse=false;
    this.loading=true;
    this.AllQueries=[];
    this.pageSize=10;
    this.count=0;
    this.pagearray=[];

    this.setNavbar = function(){
        $('nav').addClass('second-navbar');
    };


    main.setNavbar();

    //Get tickets    
    this.getUser = function(){
        //Set loading on
        main.loading=true;

        //Call authService for user details
        authService.getUser().then(function(data){
            var main1=this;
            main.userName=data.data.name;
            main.userId=data.data.userId;

            //Set initial queries filter to my queries
            $scope.query.userId=data.data.userId;

            //Set intitial status filter to All
            $scope.query.ticketStatus = '';

            //Check if admin
            if(main.userName == 'Admin Admin') main.admin = true;
            else main.admin = false;

            main.loading=false;
          
        });
         
    };

    //Call getUser
    main.getUser();

    //Calculate number of page for page filter
    this.numberOfPages=function(l){
        return Math.ceil(l/main.pageSize);
    };

    //filter for created At
    $scope.predicate = '-createdAt';
  
    //filter for sorting
    $scope.sort = function(predicate) {
        $scope.predicate = predicate;
    }

    //Filter query by type
    this.filterQueryType = function(v){
        if(v==0)
        {
            if($('#queryTypeSwitch').prop('checked')){$scope.query.userId='';}
            else $scope.query.userId = main.userId;
        }
        else
        {
            if($('#queryTypeSwitch1').prop('checked')){$scope.query.userId='';}
            else $scope.query.userId = main.userId;
        }
            
    };

    //Filter query by Status
    this.filterQueryStatus= function(status){
        if(status == '') {$scope.query.ticketStatus='';}
        else $scope.query.ticketStatus=status;
    };

    


    //Get tickets
    this.getTickets = function(){

        //Get all tickets
        ticketService.getAllTickets().then(function(data){

            //Set loading to false
            main.loading = false;
            if(data.data.error)
            {
                //Set error message
                main.errorMessage=data.data.message;
            }
            else
            {   
                //Set all queries
                main.allQueries=data.data.data;                                
            }
        });
    };

    //Get tickets
    this.deleteTicket = function(id){

        //Get all tickets
        ticketService.delete(id).then(function(data){

            if(data.data.error)
            {
                //Set error message
                main.errorMessage=data.data.message;
            }
            else
            {
                //Set success message
                main.successMessage=data.data.message;
                toastr.error("Ticket deleted !") ;  
                main.getTickets();                              
            }
        });
    };


    

    //Call getTickets
    main.getTickets();


    //Redirect to query details
    this.getDetail = function(id){
    	$location.path('/query/'+id);
    };


}]);











