app.factory('interceptorService',function (tokenService){

	var authInterceptorFactory={};

	//Factory to set token in request header
	authInterceptorFactory.request = function(config){

		//Get token from token service
	  	var token = tokenService.getToken();

	  	if(tokenService){

	  		//Set token in headers
	  		config.headers['x-access-token']=token;
	  	}

	  	return config;

  	};

  	return authInterceptorFactory;

});