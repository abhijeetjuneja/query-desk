//Declare the service

app.factory('ticketService',function allData($http){

    var ticketFactory={};

    //Factory to create ticket
    ticketFactory.create = function(ticketData){
        return $http.post('/ticket/create',ticketData);
    };

    //Factory to delete ticket
    ticketFactory.delete = function(ticketId){
        return $http.post('/ticket/delete/'+ticketId);
    };

    //Factory to get all tickets
    ticketFactory.getAllTickets = function(){
        return $http.get('/ticket/all');
    };

    //Factory to get ticket by Id
    ticketFactory.getTicketById = function(ticketId){
        return $http.get('/ticket/view/'+ ticketId);
    };

    //Factory to comment on ticket
    ticketFactory.comment = function(answerData){
        return $http.post('/ticket/comment/'+ answerData.ticketId,answerData);
    };

    //Factory to change status of ticket
    ticketFactory.changeStatus = function(statusData){
        return $http.put('/ticket/changeStatus/'+ statusData.ticketId,statusData);
    };

    return ticketFactory;

});