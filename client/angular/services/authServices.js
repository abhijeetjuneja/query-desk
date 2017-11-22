//Declare the service

app.factory('authService',function allData($http,$window,tokenService){

    var authFactory={};

    //Factory for login
    authFactory.login = function(loginData){
        return $http.post('/users/login',loginData).then(function(data){

            //Call tokenService factory to set token
        	tokenService.setToken(data.data.token);
        	return data;
        });
    };

    //Factory to check if logged in
    authFactory.isLoggedIn = function(){

        //Call tokenService to get token
      	if(tokenService.getToken())
      	{
      		return true;
      	} 
      	else
      	{
       		return false;
      	}
    };

    //Factory to get user details
    authFactory.getUser = function(){

        //Call tokenService to check if token exists
      	if(tokenService.getToken()){
      		return $http.post('/users/me');
      	}
      	else{
      		$q.reject({ message : 'User has no token' });
      	}
    };

    //Factory to logout
    authFactory.logout = function(){
      	
        //Call tokenService to set token
      	tokenService.setToken();
    };



  return authFactory;

});





