(function(){
    /* jshint -W106 */
    'use strict';

    angular.module('c6.glickm')
    .controller('LoginCtrl',['$log','$scope','$location','c6Auth',
        function($log,$scope,$location,c6Auth){
        $log = $log.context('LoginCtrl');
        $log.info('instantiated');
        $scope.username = '';
        $scope.password = '';
        $scope.error    = '';

        $scope.login = function(){
            $log.info('logging in %1', $scope.username);
            c6Auth.login($scope.username,$scope.password)
            .then(function(data){
                $log.info('success:',data);
                $location.path('/experience').replace();
            })
            .catch(function(err){
                $log.error('error:',err);
                $scope.error = err;
            });
        };
    }]);
}());

