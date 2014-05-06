(function(){
    /* jshint -W106 */
    'use strict';

    angular.module('c6.glickm')
    .controller('LoginCtrl',['$log','$scope','auth', 'tracker',
        function($log,$scope,auth,tracker){
        $log = $log.context('LoginCtrl');
        $log.info('instantiated, scope=%1',$scope.$id);
        $scope.email = '';
        $scope.password = '';
        $scope.loginError    = '';

        $scope.login = function(){
            $log.info('logging in %1', $scope.email);

            if ( (!$scope.email) || (!$scope.password) ||
                 ($scope.email.match(/^\s*$/)) || ($scope.password.match(/^\s*$/)) ){
                $scope.loginError = 'Email and password required.';
                return;
            }

            auth.login($scope.email,$scope.password)
            .then(function(data){
                $log.info('success:',data);
                $scope.$emit('loginSuccess',data);
            })
            .catch(function(err){
                $log.error('error:',err);
                $scope.loginError = err;
            });
        };

        tracker.pageview('/login','Cinema6 Portal');

    }])
    .animation('.login__group', function() {
        return {
            beforeAddClass: function($element, className, done) {
                if (className  !== 'ng-hide'){
                    return;
                }
                $element.css('opacity',1);
                $element.animate(
                    {
                        opacity: 0
                    },
                    {
                        duration: 250,
                        easing: 'linear',
                        complete: done
                    }
                );
            }
        };
    });
}());

