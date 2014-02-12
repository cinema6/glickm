(function(){
    'use strict';

    define(['login', 'templates'], function() {
        describe('LoginCtrl', function() {
            var $rootScope,
                $scope,
                $log,
                $q,
                $location,
                c6Auth,
                LoginCtrl;

            beforeEach(function() {

                c6Auth = {
                    login : jasmine.createSpy('c6Auth.login')
                };

                $location = {
                    path : jasmine.createSpy('$location.path')
                };

                $location.path.andReturn ( { replace : function(){} });

                module('c6.glickm', function($provide) {
                    $provide.value('c6Auth', c6Auth);
                    $provide.value('$location', $location);
                });

                inject(function($injector, $controller, c6EventEmitter) {
                    $q          = $injector.get('$q');
                    $log        = $injector.get('$log');
                    $rootScope  = $injector.get('$rootScope');
                    $scope      = $rootScope.$new();
                   
                    $log.context = function(){ return $log; }

                    LoginCtrl = $controller('LoginCtrl', {
                        $scope  : $scope,
                        $log    : $log,
                        c6Auth  : c6Auth
                    });
                });
            });


            describe('login method',function(){
                it('will attempt to redirect to experience upon success',function(){
                    c6Auth.login.andReturn($q.when(true));
                    $scope.username = 'howard';
                    $scope.password = 'foo';
                    $scope.login();
                    $scope.$digest();
                    expect(c6Auth.login).toHaveBeenCalledWith('howard','foo');
                    expect($location.path).toHaveBeenCalledWith('/experience');
                });

                it('will set error property with error if it fails',function(){
                    c6Auth.login.andReturn($q.reject('Failed to work'));
                    $scope.username = 'howard';
                    $scope.password = 'foo';
                    $scope.login();
                    $scope.$digest();
                    expect(c6Auth.login).toHaveBeenCalledWith('howard','foo');
                    expect($scope.error).toEqual('Failed to work');
                });
            });
        });
    });

}());

