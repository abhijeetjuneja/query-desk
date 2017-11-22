app.controller('resetController',['$http','userService','$location','authService','$timeout','$scope','$q','$routeParams',function($http,userService,$location,authService,$timeout,$scope,$q,$routeParams){

    var main=this;

    main.hide=true;

    this.setNavbar = function(){
        $('nav').addClass('second-navbar');
    };

    main.setNavbar();

    //Check if token is valid by calling user service
    userService.resetUser($routeParams.token).then(function(data){
      
        if(data.data.error){
            //Set error message for invalid token
            main.tokenErrorMessage=data.data.message;

        } 
        else
        {
            //Show message
            main.hide=false;

            //Save email in scope
            $scope.email=data.data.data.email;

            //Set success message by calling user service
            main.tokenSuccessMessage="Please enter a new password";
        }
    });


    //Save new password
    this.savePassword=function(regData,valid,confirmed){

        //Intialize error message and loading
        this.errorMessage=false;
        this.disabled=true;
        this.loading=true;

        //Set regdata email from scope
        this.regData.email=$scope.email;

        //If form is valid
        if(valid && confirmed){   

            //Calll user service for saving password
            userService.savePassword(main.regData).then(function(data){

                //Set loading to false
                main.loading=false;

                if(data.data.error){

                    //Set error message
                    main.errorMessage=data.data.message;
                    toastr.error(main.errorMessage) ;

                } else{

                    //Show message
                    main.hide=false;

                    //Set success message
                    main.successMessage="Password changed !";
                    toastr.success(main.successMessage) ; 
                    $location.path('/');

                }
            });
        } 
        else
        {
            //Set loading to false
            main.loading=false;
            main.disabled=false;

            //Set error message for incomplete form
            main.errorMessage="Please fill out the form properly";
        }
    };



    //Send new password    
    this.sendEmail = function(resetData, valid){

        //Set loading and error messages
        main.loading = true;
        main.errorMessage=false;
        main.successMessage=false;
        main.disabled=true;

        if(valid){

            //Call user service
            userService.sendPassword(this.resetData).then(function(data){

                //Set loading to false
                main.loading = false;
                if(data.data.error)
                {
                    //Set error message
                    main.emailErrorMessage=data.data.message;
                    toastr.error(main.emailErrorMessage) ;  
                }
                else
                {
                    //Set success message
                    main.emailSuccessMessage=data.data.message;
                    toastr.success(main.emailSuccessMessage) ;  
                    $location.path('/');
                }
            });
        } 
        else
        {
            //Set loading to false
            main.loading = false;

            //Set error message
            main.emailErrorMessage="Please enter a registered Email";
        }

    };



}]);
