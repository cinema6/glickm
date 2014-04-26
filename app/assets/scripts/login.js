(function(){
    /* jshint -W106 */
    'use strict';

    angular.module('c6.glickm')
    .controller('LoginCtrl',['$log','$scope','auth', function($log,$scope,auth){
        $log = $log.context('LoginCtrl');
        $log.info('instantiated, scope=%1',$scope.$id);
        $scope.username = '';
        $scope.password = '';
        $scope.loginError    = '';

        $scope.login = function(){
            $log.info('logging in %1', $scope.username);

            if ( (!$scope.username) || (!$scope.password) ||
                 ($scope.username.match(/^\s*$/)) || ($scope.password.match(/^\s*$/)) ){
                $scope.loginError = 'Username and password required.';
                return;
            }

            auth.login($scope.username,$scope.password)
            .then(function(data){
                $log.info('success:',data);
                $scope.$emit('loginSuccess',data);
            })
            .catch(function(err){
                $log.error('error:',err);
                $scope.loginError = err;
            });
        };

        $scope.logout = function(){
            $log.info('logging out');
            auth.logout()
            .then(function(data){
                $log.info('success:',data);
                $scope.$emit('logout');
            })
            .catch(function(err){
                $log.error('error:',err);
                $scope.$emit('logout');
            });
        };
    }]);
}());

