app.controller('mainController',['userService','authService','tokenService','$location','$timeout','$scope','$q','$rootScope','$interval','$window','$route','ticketService',function(userService,authService,tokenService,$location,$timeout,$scope,$q,$rootScope,$interval,$window,$route,ticketService){
    
    var main=this;
    main.load=false;
    main.loginData={};
    main.route=$location.path();

    this.setNavbar = function(){
        $('nav').removeClass('second-navbar');
    };


    main.setNavbar();

    //Hide Signup/Login Modal
    this.hideModal = function(){
        $('#modalLoginForm').modal('hide');

        //Reset form
        main.reset($scope.loginForm,"loginForm");
        main.reset($scope.regForm,"regForm");
        $('i').removeClass('active');
      
    };

    //reset form
    this.reset = function(form,name) {
        document.getElementById(name).reset();
        form.$setPristine();
        main.loginData = {};
        main.regData={};
        form.$setUntouched();
        form.$submitted = false;
    };

    //Check whether logged in on route change
    $rootScope.$on('$routeChangeStart',function(){

        if($location.path() == '/')
            main.setNavbar();

        //If logged in
        if(authService.isLoggedIn()) {

            //Set intially to false
            main.loggedIn=false;

            //Call authService to get User
            authService.getUser().then(function(data){

                //If error
                if(data.data.error){

                    //Load page
                    main.load=true;

                    //Set logged in as false
                    main.loggedIn=false;
                } 
                else
                {    
                    //Set logged in as true
                    main.loggedIn=true;

                    //Save user data
                    main.name = data.data.name;
                    main.email=data.data.email;
                    main.mobile=data.data.mobile;
                    main.userId=data.data.userId;

                    //Load page
                    main.load=true;
                }          
            });

        }
        else
        {
            //Set logged in as false
            main.loggedIn=false;
            main.name = '';

            //Load page
            main.load=true;
        }

    });
    

    //Login user    
    this.loginUser = function(loginData,valid){

        //Set loading for login form
        main.loading = true;

        //Set error and success message for login form
        main.errorMessage=false;
        main.successMessage=false;

        if(valid)
        {
            authService.login(this.loginData).then(function(data){
                //Remove loading for login form
                main.loading = false;
                if(data.data.error)
                {
                    //Set error message for login form
                    main.errorMessage=data.data.message;

                    //Reset form
                    document.getElementById("loginForm").reset();

                }
                else
                {
                    //Set success message for login form
                    main.successMessage=data.data.message + '...Redirecting';

                    //Reset form
                    main.reset($scope.loginForm,"loginForm");
                    main.reset($scope.regForm,"regForm");

                    //Set timeout for redirecting to dashboard after login
                    $timeout(function(){
                        $('#modalLoginForm').modal('hide');
                        $location.path('/dashboard');

                        //Remove success message
                        main.successMessage=false;

                        //Remove login data
                        main.loginData='';
                    },2000);
                  
                }
            });
        }
        else
        {
            //Set loading for login form
            main.loading = false;

            //Set error message
            main.errorMessage="Please ensure the form is filled properly";
        }
        

    };


    //Register user
    this.regUser = function(regData, valid){

        //Set loading for login form
        main.loading = true;
        
        //Set error and success message for login form
        main.errorMessage=false;
        main.successMessage=false;

        //If form is valid
        if(valid){
            userService.signup(this.regData).then(function(data){

                //Set loading for login form
                main.loading = false;
                if(data.data.error)
                {
                    //Set error message for login form
                    main.errorMessage=data.data.message;
                }
                else
                {
                    //Set success message for login form
                    main.successMessage=data.data.message + '...Redirecting';
                    
                    //Reset form
                    main.reset($scope.loginForm,"loginForm");
                    main.reset($scope.regForm,"regForm");

                    //Set timeout for redirecting to dashboard after login
                    $timeout(function(){
                        $('#modalLoginForm').modal('hide');
                        $location.path('/dashboard');

                        //Remove success message
                        main.successMessage=false;
                    },2000);
                  
                }
            });
        } 
        else
        {

            //Set loading for login form
            main.loading = false;

            //Set error message
            main.errorMessage="Please ensure the form is filled properly";

        }

    };


    //Check if email is available
    this.checkEmail = function(regData){

        //Set loader for email check
        main.checkingEmail=true;

        //Set message for email
        main.emailMsg=false;

        //Set email valid
        main.emailInvalid=false;

        //Call userservice for email check
        userService.checkEmail(this.regData).then(function(data){
            main.checkingEmail=false;
            if(data.data.error){

                //Set email invalid
                main.emailInvalid=true;

                //Set email message
                main.emailMsg=data.data.message;
            } 
            else
            {
                //Set email valid
                main.emailInvalid=false;

                //Set email message
                main.emailMsg=data.data.message;
            }
        });
      
    };


    //Logout
    this.logout = function(){

        //Call authservice for logging out
        authService.logout();
        $location.path('/');
        $window.location.reload();
        //Reset form
        main.reset($scope.loginForm,"loginForm");
        main.reset($scope.regForm,"regForm");
                    
        
    };

    //Tpoast setup
    toastr.options = {
      "positionClass": "toast-top-center",
      "showMethod": "show",
      "hideMethod": "hide"
    };


}]);