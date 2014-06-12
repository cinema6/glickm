(function(){
    'use strict';

    define(['login', 'templates'], function() {
        describe('LoginCtrl', function() {
            var $rootScope,
                $scope,
                $log,
                $q,
                account,
                auth,
                tracker,
                LoginCtrl;

            beforeEach(function() {

                account = {
                    getOrg      : jasmine.createSpy('account.getOrg')
                };

                auth = {
                    login  : jasmine.createSpy('auth.login')
                };
                
                tracker = {
                    pageview :  jasmine.createSpy('tracker.pageview')
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

                inject(function($injector, $controller ) {
                    $q          = $injector.get('$q');
                    $log        = $injector.get('$log');
                    $rootScope  = $injector.get('$rootScope');
                    $scope      = $rootScope.$new();
                   
                    account.getOrg.deferred = $q.defer();
                    account.getOrg.andReturn(account.getOrg.deferred.promise);

                    $log.context = function(){ return $log; }

                    LoginCtrl = $controller('LoginCtrl', {
                        $scope  : $scope,
                        $log    : $log,
                        account : account,
                        auth    : auth,
                        tracker : tracker
                    });
                });
            });

            describe('tracking',function(){

                it('will send a pageview when it loads',function(){
                    expect(tracker.pageview).toHaveBeenCalledWith('/login','Cinema6 Portal');
                });
            });

            describe('login method',function(){
                it('will emit loginSuccess upon success',function(){
                    var mockUser = { id : 'u1', org: 'o1'  },
                        mockOrg  = { id : 'o1' };
                    auth.login.andReturn($q.when(mockUser));
                    account.getOrg.andReturn($q.when(mockOrg));
                    $scope.$emit = jasmine.createSpy('$scope.$emit');
                    $scope.email = 'howard';
                    $scope.password = 'foo';
                    $scope.login();
                    $scope.$digest();
                    expect(auth.login).toHaveBeenCalledWith('howard','foo');
                    expect(account.getOrg).toHaveBeenCalledWith('o1');
                    expect($scope.$emit).toHaveBeenCalledWith('loginSuccess',
                        { id : 'u1', org : { id : 'o1' } });
                });

                it('will set loginError property with error if it fails',function(){
                    auth.login.andReturn($q.reject('Failed to work'));
                    $scope.email = 'howard';
                    $scope.password = 'foo';
                    $scope.login();
                    $scope.$digest();
                    expect(auth.login).toHaveBeenCalledWith('howard','foo');
                    expect($scope.loginError).toEqual('Failed to work');
                });

                it('will set loginError if login succeeds but cant find org',function(){
                    var mockUser = { id : 'u1', org: 'o1'  };
                    auth.login.andReturn($q.when(mockUser));
                    account.getOrg.andReturn($q.reject('Failed to work'));
                    $scope.email = 'howard';
                    $scope.password = 'foo';
                    $scope.login();
                    $scope.$digest();
                    expect(auth.login).toHaveBeenCalledWith('howard','foo');
                    expect(account.getOrg).toHaveBeenCalledWith('o1');
                    expect($scope.loginError).toEqual('There is a problem with your account, please contact customer service.');
                });

                it('does nothing if email is blank',function(){
                    auth.login.andReturn($q.when({}));
                    $scope.email = '';
                    $scope.password = 'abc';
                    $scope.login();
                    $scope.$digest();
                    expect(auth.login).not.toHaveBeenCalled();
                    expect($scope.loginError).toEqual('Email and password required.');
                });
                
                it('does nothing if email is blank with spaces',function(){
                    auth.login.andReturn($q.when({}));
                    $scope.email = '   ';
                    $scope.password = 'abc';
                    $scope.login();
                    $scope.$digest();
                    expect(auth.login).not.toHaveBeenCalled();
                    expect($scope.loginError).toEqual('Email and password required.');
                });
                
                it('does nothing if password is blank',function(){
                    auth.login.andReturn($q.when({}));
                    $scope.email = 'xxyx';
                    $scope.password = '';
                    $scope.login();
                    $scope.$digest();
                    expect(auth.login).not.toHaveBeenCalled();
                    expect($scope.loginError).toEqual('Email and password required.');
                });
                
                it('does nothing if password is blank with spaces',function(){
                    auth.login.andReturn($q.when({}));
                    $scope.email = 'xxyx';
                    $scope.password = ' ';
                    $scope.login();
                    $scope.$digest();
                    expect(auth.login).not.toHaveBeenCalled();
                    expect($scope.loginError).toEqual('Email and password required.');
                });
            });
        });
    });

}());

