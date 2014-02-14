(function(){
    /* jshint -W106 */
    'use strict';

    angular.module('c6.glickm')
    .controller('LoginCtrl',['$log','$scope','c6Auth', function($log,$scope,c6Auth){
        $log = $log.context('LoginCtrl');
        $log.info('instantiated');
        $scope.username = '';
        $scope.password = '';
        $scope.loginError    = '';

        $scope.login = function(){
            $log.info('logging in %1', $scope.username);
            c6Auth.login($scope.username,$scope.password)
            .then(function(data){
                $log.info('success:',data);
                $scope.$emit('loginSuccess',data.user);
            })
            .catch(function(err){
                $log.error('error:',err);
                $scope.loginError = err;
            });
        };

        $scope.logout = function(){
            $log.info('logging out');
            c6Auth.logout()
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

