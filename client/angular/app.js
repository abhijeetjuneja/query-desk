//Import ngRoute and Animate
var app=angular.module('queryDesk',['ngRoute','ngAnimate'])

//Push authInterceptor in httpProvidor
.config(function($httpProvider){
	$httpProvider.interceptors.push('interceptorService');   
});

