
app.config(['$routeProvider','$locationProvider', function($routeProvider,$locationProvider){
    $routeProvider
    	.when('/',{
            // location of the template
            templateUrl     : 'views/home-view.html',
            // Which controller it should use
        })
        .when('/register',{
            // location of the template
            templateUrl     : 'views/home-view.html',
            // Which controller it should use
            authenticated   :  false
        })
        .when('/login',{
            // location of the template
            templateUrl     : 'views/home-view.html',
            authenticated   :  false
        })
        .when('/resetpassword',{
            // location of the template
            templateUrl     : 'views/resetpassword.html',
            controller      : 'resetController',
            controllerAs    : 'reset',
            authenticated   :  false
        })
        .when('/resetpassword/:token',{
            // location of the template
            templateUrl     : 'views/newpassword.html',
            controller      : 'resetController',
            controllerAs    : 'reset',
            authenticated   :  false 
        })
        .when('/query/create',{
            // location of the template
            templateUrl     : 'views/create-query-view.html',
            controller      : 'ticketController',
            controllerAs    : 'ticket',
            authenticated   :  true 
        })
        .when('/dashboard',{
            // location of the template
            templateUrl     : 'views/dashboard-view.html',
            controller      : 'dashboardController',
            controllerAs    : 'dashboard',
            authenticated   :  true 
        })
        .when('/query/:id',{
            // location of the template
            templateUrl     : 'views/query-detail-view.html',
            controller      : 'ticketController',
            controllerAs    : 'ticket',
            authenticated   :  true 
        })
        .otherwise(
            {
                //redirectTo:'/'
                templateUrl   : 'views/error404.html'
            }
        );
        $locationProvider.html5Mode({
  enabled: true,
  requireBase: false
}).hashPrefix('');
}]);


//Avoid unauthorized access to routes
app.run(['$rootScope','authService','$location',function($rootScope,authService,$location){
    $rootScope.$on('$routeChangeStart',function(event,next,current){

        if(next.hasOwnProperty('$$route')){
            //If logged In
            if(next.$$route.authenticated==true){
                if(!authService.isLoggedIn()){
                    event.preventDefault();
                    $location.path('/');
                }
            }else
            //If not logged in
            if(next.$$route.authenticated==false){
                if(authService.isLoggedIn()){
                    event.preventDefault();
                    $location.path('/dashboard');
                }
            }
        }

    });
}]);