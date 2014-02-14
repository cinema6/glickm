(function(){
    'use strict';

    define(['login', 'templates'], function() {
        describe('LoginCtrl', function() {
            var $rootScope,
                $scope,
                $log,
                $q,
                c6Auth,
                LoginCtrl;

            beforeEach(function() {

                c6Auth = {
                    login  : jasmine.createSpy('c6Auth.login'),
                    logout : jasmine.createSpy('c6Auth.logout')
                };

                module('c6.glickm', function($provide) {
                    $provide.value('c6Auth', c6Auth);
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
                it('will emit loginSuccess upon success',function(){
                    var mockUser = { user : { id : 'x' } };
                    c6Auth.login.andReturn($q.when(mockUser));
                    $scope.$emit = jasmine.createSpy('$scope.$emit');
                    $scope.username = 'howard';
                    $scope.password = 'foo';
                    $scope.login();
                    $scope.$digest();
                    expect(c6Auth.login).toHaveBeenCalledWith('howard','foo');
                    expect($scope.$emit).toHaveBeenCalledWith('loginSuccess',mockUser.user);
                });

                it('will set loginError property with error if it fails',function(){
                    c6Auth.login.andReturn($q.reject('Failed to work'));
                    $scope.username = 'howard';
                    $scope.password = 'foo';
                    $scope.login();
                    $scope.$digest();
                    expect(c6Auth.login).toHaveBeenCalledWith('howard','foo');
                    expect($scope.loginError).toEqual('Failed to work');
                });

                it('does nothing if username is blank',function(){
                    c6Auth.login.andReturn($q.when({}));
                    $scope.username = '';
                    $scope.password = 'abc';
                    $scope.login();
                    $scope.$digest();
                    expect(c6Auth.login).not.toHaveBeenCalled();
                    expect($scope.loginError).toEqual('Username and password required.');
                });
                
                it('does nothing if username is blank with spaces',function(){
                    c6Auth.login.andReturn($q.when({}));
                    $scope.username = '   ';
                    $scope.password = 'abc';
                    $scope.login();
                    $scope.$digest();
                    expect(c6Auth.login).not.toHaveBeenCalled();
                    expect($scope.loginError).toEqual('Username and password required.');
                });
                
                it('does nothing if password is blank',function(){
                    c6Auth.login.andReturn($q.when({}));
                    $scope.username = 'xxyx';
                    $scope.password = '';
                    $scope.login();
                    $scope.$digest();
                    expect(c6Auth.login).not.toHaveBeenCalled();
                    expect($scope.loginError).toEqual('Username and password required.');
                });
                
                it('does nothing if password is blank with spaces',function(){
                    c6Auth.login.andReturn($q.when({}));
                    $scope.username = 'xxyx';
                    $scope.password = ' ';
                    $scope.login();
                    $scope.$digest();
                    expect(c6Auth.login).not.toHaveBeenCalled();
                    expect($scope.loginError).toEqual('Username and password required.');
                });
            });

            describe('logout method',function(){
                it('will emit logout event upon success',function(){
                    c6Auth.logout.andReturn($q.when('Success'));
                    $scope.$emit = jasmine.createSpy('$scope.$emit');
                    $scope.logout();
                    $scope.$digest();
                    expect(c6Auth.logout).toHaveBeenCalled();
                    expect($scope.$emit).toHaveBeenCalledWith('logout');
                });

                it('will emit logout event up success',function(){
                    c6Auth.logout.andReturn($q.reject('Failure'));
                    $scope.$emit = jasmine.createSpy('$scope.$emit');
                    $scope.logout();
                    $scope.$digest();
                    expect(c6Auth.logout).toHaveBeenCalled();
                    expect($scope.$emit).toHaveBeenCalledWith('logout');
                });
            });
        });
    });

}());

