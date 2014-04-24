(function(){
    /* jshint -W106 */
    'use strict';

    angular.module('c6.glickm.services',[])
    .provider('c6Auth',function(){

        var config = {
            baseUrl : '/api',
            timeout : 10000
        };

        Object.defineProperty(this,'timeout',{
            get : function() {
                        return config.timeout;
                    },
            set : function(val) {
                        config.timeout = val;
                        return this;
                    }
        });

        Object.defineProperty(this,'baseUrl',{
            get : function() {
                        return config.baseUrl;
                    },
            set : function(url) {
                        config.baseUrl = url;
                        return this;
                    }
        });

        this.$get = function($http,$q,$timeout){
            var service = {};

            service.login = function(username,password){
                var deferred = $q.defer(), deferredTimeout = $q.defer(), cancelTimeout,
                    body = {
                        username : username,
                        password : password
                    };

                $http({
                    method       : 'POST',
                    url          : config.baseUrl + '/auth/login',
                    data         : body,
                    timeout      : deferredTimeout.promise
                })
                .success(function(data ){
                    $timeout.cancel(cancelTimeout);
                    deferred.resolve(data);
                })
                .error(function(data){
                    if (!data){
                        data = 'Login failed';
                    }
                    $timeout.cancel(cancelTimeout);
                    deferred.reject(data);
                });

                cancelTimeout = $timeout(function(){
                    deferredTimeout.resolve();
                    deferred.reject('Request timed out.');
                },config.timeout);

                return deferred.promise;
            };

            service.logout = function(){
                var deferred = $q.defer(), deferredTimeout = $q.defer(), cancelTimeout;
                
                $http({
                    method       : 'POST',
                    url          : config.baseUrl + '/auth/logout',
                    timeout      : deferredTimeout.promise
                })
                .success(function(data ){
                    $timeout.cancel(cancelTimeout);
                    deferred.resolve(data);
                })
                .error(function(data){
                    if (!data){
                        data = 'Logout failed';
                    } else
                    if (data.error) {
                        data = data.error;
                    }
                    $timeout.cancel(cancelTimeout);
                    deferred.reject(data);
                });

                cancelTimeout = $timeout(function(){
                    deferredTimeout.resolve();
                    deferred.reject('Request timed out.');
                },config.timeout);

                return deferred.promise;
            };

            return service;
        };

        this.$get.$inject = [ '$http', '$q', '$timeout' ];

    });

}());
