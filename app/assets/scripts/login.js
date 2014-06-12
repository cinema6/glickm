(function(){
    /* jshint -W106 */
    'use strict';

    angular.module('c6.glickm')
    .controller('LoginCtrl',['$log','$scope','auth', 'account', 'tracker',
        function($log,$scope,auth,account,tracker){
        $log = $log.context('LoginCtrl');
        $log.info('instantiated, scope=%1',$scope.$id);
        $scope.email = '';
        $scope.password = '';
        $scope.loginError    = '';

        $scope.login = function(){
            var user;
            $log.info('logging in %1', $scope.email);

            if ( (!$scope.email) || (!$scope.password) ||
                 ($scope.email.match(/^\s*$/)) || ($scope.password.match(/^\s*$/)) ){
                $scope.loginError = 'Email and password required.';
                return;
            }

            auth.login($scope.email,$scope.password)
            .then(function(data){
                user = data;
                $log.info('success:',user);
                return account.getOrg(user.org);
            })
            .then(function(org){
                user.org = org;
                $scope.$emit('loginSuccess',user);
            })
            .catch(function(err){
                $log.error('error:',err);
                if (user){
                    $scope.loginError = 'There is a problem with your account, ' +
                        'please contact customer service.';
                    return;
                }
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

