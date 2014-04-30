(function(){
    /* jshint -W106 */
    'use strict';

    angular.module('c6.glickm')
    .controller('AcctChangeCtrl',['$log','$scope','account',function($log,$scope,account){
        $log = $log.context('AcctChangeCtrl');
        $log.info('instantiated, scope=%1',$scope.$id);
        var self = this;

        self.changeUsername = function(origUsername,password,newUsername){
            $log.info('changeUsername:',origUsername,newUsername);
            return account.changeUsername(origUsername,password,newUsername);
        };

        self.changePassword = function(username,origPassword,newPassword){
            $log.info('changePassword:',username);
            return account.changePassword(username,origPassword,newPassword);
        };
    }])
    .directive('changeUsername',['$log','c6UrlMaker',function($log,c6UrlMaker){
        function fnLink(scope,element,attrs,ctrl){
            var origUsername = scope.username;
            scope.password = '';
            scope.submit = function(){
                ctrl.changeUsername(origUsername,scope.username,scope.password);
            };

            scope.invalid = function(){
                return ((scope.password === null) || (origUsername === scope.username));
            };
        }
        return {
            controller : 'AcctChangeCtrl',
            link : fnLink,
            scope : {
                username : '@'
            },
            restrict : 'E',
            templateUrl : c6UrlMaker('views/change_username.html')
        };
    }])
    .directive('changePassword',['$log','c6UrlMaker',function($log,c6UrlMaker){
        function fnLink(scope,element,attrs,ctrl){
            scope.password = [null,null,null];
            scope.submit = function(){
                ctrl.changePassword(scope.username,scope.password);
            };
            scope.invalid = function(){
                return  (((scope.password[0] === null) ||
                         (scope.password[1] === null) ||
                         (scope.password[2] === null) ) ||
                        (scope.password[1] !== scope.password[2])) ;
            };
        }
        return {
            controller : 'AcctChangeCtrl',
            link : fnLink,
            scope : {
                username : '@'
            },
            restrict : 'E',
            templateUrl : c6UrlMaker('views/change_password.html')
        };
    }])
    .service('account',['c6UrlMaker','$http','$q','$timeout',
        function(c6UrlMaker,$http,$q,$timeout){

        this.changeUsername = function(username,password,newUsername){
            var deferred = $q.defer(), deferredTimeout = $q.defer(), cancelTimeout,
                body = {
                    username    : username,
                    password    : password,
                    newUsername : newUsername,
                };

            $http({
                method       : 'POST',
                url          : c6UrlMaker('account/user/username','api'),
                data         : body,
                timeout      : deferredTimeout.promise
            })
            .success(function(data ){
                $timeout.cancel(cancelTimeout);
                deferred.resolve(data);
            })
            .error(function(data,status){
                if (!data){
                    data = status;
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

        this.changePassword = function(username,password,newPassword) {
            var deferred = $q.defer(), deferredTimeout = $q.defer(), cancelTimeout,
                body = {
                    username    : username,
                    password    : password,
                    newPassword : newPassword
                };

            $http({
                method       : 'POST',
                url          : c6UrlMaker('account/user/password','api'),
                data         : body,
                timeout      : deferredTimeout.promise
            })
            .success(function(data ){
                $timeout.cancel(cancelTimeout);
                deferred.resolve(data);
            })
            .error(function(data, status){
                if (!data){
                    data = status;
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


