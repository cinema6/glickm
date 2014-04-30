(function(){
    /* jshint -W106 */
    'use strict';

    angular.module('c6.glickm')
    .controller('AcctChangeCtrl',['$log','$scope','account',function($log,$scope,account){
        $log = $log.context('AcctChangeCtrl');
        $log.info('instantiated, scope=%1',$scope.$id);
        var self = this;

        self.changeEmail = function(origEmail,password,newEmail){
            $log.info('changeEmail:',origEmail,newEmail);
            return account.changeEmail(origEmail,password,newEmail);
        };

        self.changePassword = function(email,origPassword,newPassword){
            $log.info('changePassword:',email);
            return account.changePassword(email,origPassword,newPassword);
        };
    }])
    .directive('changeEmail',['$log','c6UrlMaker',function($log,c6UrlMaker){
        function fnLink(scope,element,attrs,ctrl){
            scope.origEmail     = attrs.email;
            scope.email         = null;
            scope.password      = '';
            scope.lastStatus    = null;
            scope.lastCode      = 0;
            scope.emailPattern  = /^\w+.*\.\w\w\w?$/;

            scope.submit = function(){
                scope.lastStatus = null;
                scope.lastCode   = 0;
                scope.email = scope.email.replace(/\s+$/,'');
                ctrl.changeEmail(scope.origEmail,scope.password,scope.email)
                .then(function(){
                    $log.info('changed email for:',scope.email);
                    scope.lastStatus = 'User name has been changed.';
                    scope.$emit('emailChange',scope.email,scope.origEmail);
                })
                .catch(function(err){
                    $log.warn('failed changed email for:',scope.email,err);
                    scope.lastStatusCode = 1;
                    scope.lastStatus = 'User name change failed: ' + err;
                });
            };
        }
        return {
            controller : 'AcctChangeCtrl',
            link : fnLink,
            scope : {
            },
            restrict : 'E',
            templateUrl : c6UrlMaker('views/change_email.html')
        };
    }])
    .directive('changePassword',['$log','c6UrlMaker',function($log,c6UrlMaker){
        function fnLink(scope,element,attrs,ctrl){
            scope.lastStatus    = null;
            scope.lastCode      = 0;
            scope.password = [null,null,null];
        
            scope.submit = function(){
                scope.lastStatus = null;
                scope.lastCode = 0;
                ctrl.changePassword(scope.email,scope.password[0],scope.password[1])
                .then(function(){
                    $log.info('changed password for:',scope.email);
                    scope.lastStatus = 'Password has been changed.';
                })
                .catch(function(err){
                    $log.warn('failed changed password for:',scope.email,err);
                    scope.lastStatus = 'Password change failed: ' + err;
                    scope.lastCode = 1;
                });
            };
        }
        return {
            controller : 'AcctChangeCtrl',
            link : fnLink,
            scope : {
                email : '@'
            },
            restrict : 'E',
            templateUrl : c6UrlMaker('views/change_password.html')
        };
    }])
    .service('account',['c6UrlMaker','$http','$q','$timeout',
        function(c6UrlMaker,$http,$q,$timeout){

        this.changeEmail = function(email,password,newEmail){
            var deferred = $q.defer(), deferredTimeout = $q.defer(), cancelTimeout,
                body = {
                    email    : email,
                    password    : password,
                    newEmail    : newEmail,
                };

            $http({
                method       : 'POST',
                url          : c6UrlMaker('account/user/email','api'),
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

        this.changePassword = function(email,password,newPassword) {
            var deferred = $q.defer(), deferredTimeout = $q.defer(), cancelTimeout,
                body = {
                    email       : email,
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


