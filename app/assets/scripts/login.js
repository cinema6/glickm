(function(){
    /* jshint -W106 */
    'use strict';

    angular.module('c6.glickm')
    .controller('LoginCtrl',['$log','$scope','$location','c6Auth','c6LocalStorage',
        function($log,$scope,$location,c6Auth,c6LocalStorage){
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
                c6LocalStorage.set('user',data);
                $location.path('/experience').replace();
            })
            .catch(function(err){
                $log.error('error:',err);
                $scope.loginError = err;
            });
        };
    }]);
}());

