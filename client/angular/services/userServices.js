//Declare the service

app.factory('userService',function allData($http,tokenService){

    var userFactory={};

    //Factory to signup
    userFactory.signup = function(regData){
        return $http.post('/users/signup',regData).then(function(data){

            //Call tokenservice to save token
            tokenService.setToken(data.data.token);
            return data;
        });
    };

    //Factory to check if email is already registered
    userFactory.checkEmail = function(regData){
        return $http.post('/users/checkemail',regData);
    };

    //Factory to send new password
    userFactory.sendPassword = function(resetData){
        return $http.put('/users/resetpassword',resetData);
    };

    //Factory to reset user
    userFactory.resetUser = function(token){
        return $http.get('/users/resetpassword/'+ token);
    };

    //Factory to save new password
    userFactory.savePassword = function(regData){
        return $http.put('/users/savepassword/',regData);
    };

    return userFactory;

});
