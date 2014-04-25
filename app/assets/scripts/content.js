(function(){
    /* jshint -W106 */
    'use strict';

    angular.module('c6.glickm')
    .service('content',['c6UrlMaker','$http','$q','$timeout',
        function(c6UrlMaker,$http,$q,$timeout){
        this.getExperience = function(experienceId){
            var deferred = $q.defer(), deferredTimeout = $q.defer(), cancelTimeout,
                expUrl = c6UrlMaker('/content/experience' + experienceId,'api');

            $http({
                method       : 'GET',
                url          : expUrl,
                timeout      : deferredTimeout.promise
            })
            .success(function(data){
                $timeout.cancel(cancelTimeout);
                deferred.resolve(data);
            })
            .error(function(data){
                if (!data){
                    data = 'Unable to locate failed';
                }
                $timeout.cancel(cancelTimeout);
                deferred.reject(data);
            });

            cancelTimeout = $timeout(function(){
                deferredTimeout.resolve();
                deferred.reject('Request timed out.');
            },10000);

            return deferred.promise;
        };
    }]);

}());
