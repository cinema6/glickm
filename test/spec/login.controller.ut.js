(function(){
    'use strict';

    define(['login', 'templates'], function() {
        describe('LoginCtrl', function() {
            var $rootScope,
                $scope,
                $log,
                $q,
                auth,
                LoginCtrl;

            beforeEach(function() {

                auth = {
                    login  : jasmine.createSpy('auth.login'),
                    logout : jasmine.createSpy('auth.logout')
                };
                
                module('c6.ui', ['$provide', function($provide) {
                    $provide.provider('c6UrlMaker', function(){
                        this.location = jasmine.createSpy('urlMaker.location');
                        this.makeUrl  = jasmine.createSpy('urlMaker.makeUrl');
                        this.$get = jasmine.createSpy('urlMaker.get');
                    });
                }]);

                module('c6.glickm', function($provide) {
                    $provide.value('auth', auth);
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
                        auth  : auth
                    });
                });
            });


            describe('login method',function(){
                it('will emit loginSuccess upon success',function(){
                    var mockUser = { user : { id : 'x' } };
                    auth.login.andReturn($q.when(mockUser));
                    $scope.$emit = jasmine.createSpy('$scope.$emit');
                    $scope.username = 'howard';
                    $scope.password = 'foo';
                    $scope.login();
                    $scope.$digest();
                    expect(auth.login).toHaveBeenCalledWith('howard','foo');
                    expect($scope.$emit).toHaveBeenCalledWith('loginSuccess',
                        { user : mockUser.user });
                });

                it('will set loginError property with error if it fails',function(){
                    auth.login.andReturn($q.reject('Failed to work'));
                    $scope.username = 'howard';
                    $scope.password = 'foo';
                    $scope.login();
                    $scope.$digest();
                    expect(auth.login).toHaveBeenCalledWith('howard','foo');
                    expect($scope.loginError).toEqual('Failed to work');
                });

                it('does nothing if username is blank',function(){
                    auth.login.andReturn($q.when({}));
                    $scope.username = '';
                    $scope.password = 'abc';
                    $scope.login();
                    $scope.$digest();
                    expect(auth.login).not.toHaveBeenCalled();
                    expect($scope.loginError).toEqual('Username and password required.');
                });
                
                it('does nothing if username is blank with spaces',function(){
                    auth.login.andReturn($q.when({}));
                    $scope.username = '   ';
                    $scope.password = 'abc';
                    $scope.login();
                    $scope.$digest();
                    expect(auth.login).not.toHaveBeenCalled();
                    expect($scope.loginError).toEqual('Username and password required.');
                });
                
                it('does nothing if password is blank',function(){
                    auth.login.andReturn($q.when({}));
                    $scope.username = 'xxyx';
                    $scope.password = '';
                    $scope.login();
                    $scope.$digest();
                    expect(auth.login).not.toHaveBeenCalled();
                    expect($scope.loginError).toEqual('Username and password required.');
                });
                
                it('does nothing if password is blank with spaces',function(){
                    auth.login.andReturn($q.when({}));
                    $scope.username = 'xxyx';
                    $scope.password = ' ';
                    $scope.login();
                    $scope.$digest();
                    expect(auth.login).not.toHaveBeenCalled();
                    expect($scope.loginError).toEqual('Username and password required.');
                });
            });

            describe('logout method',function(){
                it('will emit logout event upon success',function(){
                    auth.logout.andReturn($q.when('Success'));
                    $scope.$emit = jasmine.createSpy('$scope.$emit');
                    $scope.logout();
                    $scope.$digest();
                    expect(auth.logout).toHaveBeenCalled();
                    expect($scope.$emit).toHaveBeenCalledWith('logout');
                });

                it('will emit logout event up success',function(){
                    auth.logout.andReturn($q.reject('Failure'));
                    $scope.$emit = jasmine.createSpy('$scope.$emit');
                    $scope.logout();
                    $scope.$digest();
                    expect(auth.logout).toHaveBeenCalled();
                    expect($scope.$emit).toHaveBeenCalledWith('logout');
                });
            });
        });
    });

}());

