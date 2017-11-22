
app.factory('tokenService',function ($window){
	var authTokenFactory={};

    //Factory to save token in localStorage
	authTokenFactory.setToken = function(token){
      	if(token)
      		$window.localStorage.setItem('token',token); 
      	else
      		$window.localStorage.removeItem('token');
  	};

    //Factory to get token from localStorage
  	authTokenFactory.getToken = function(token){
  		return $window.localStorage.getItem('token'); 
 	};

  	return authTokenFactory;

});