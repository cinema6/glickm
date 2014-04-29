(function(){
    'use strict';

    define(['app', 'templates'], function() {
        describe('AppController', function() {
            var $location,
                $log,
                $q,
                $rootScope,
                $scope,
                $timeout,
                AppCtrl,
                appData,
                auth,
                c6Defines,
                createAppCtrl,
                localStorage,
                mockUser,
                tracker;

            beforeEach(function() {
                appData = {
                    user : null,
                    app  : null
                };

                auth = {
                    login       : jasmine.createSpy('auth.login'),
                    logout      : jasmine.createSpy('auth.logout'),
                    checkStatus : jasmine.createSpy('auth.checkStatus')
                };

                c6Defines = {
                    kTracker : {
                        accountId : 'account1',
                        config    : 'auto'
                    }
                };

                localStorage = {
                    set : jasmine.createSpy('localStorage.set'),
                    get : jasmine.createSpy('localStorage.get'),
                    remove : jasmine.createSpy('localStorage.remove')
                };

                $location = {
                    path : jasmine.createSpy('$location.path')
                };
                
                tracker = {
                    create   :  jasmine.createSpy('tracker.create'),
                    send     :  jasmine.createSpy('tracker.send'),
                    pageview :  jasmine.createSpy('tracker.pageview')
                };
                

                module('c6.glickm');

                inject(function($injector, $controller ) {
                    $log       = $injector.get('$log');
                    $q         = $injector.get('$q');
                    $rootScope = $injector.get('$rootScope');
                    $timeout   = $injector.get('$timeout');
                  
                    auth.checkStatus.deferred = $q.defer();
                    auth.checkStatus.andReturn(auth.checkStatus.deferred.promise);
                    auth.logout.deferred = $q.defer();
                    auth.logout.andReturn(auth.logout.deferred.promise);

                    $log.context = function(){ return $log; }

                    $scope = $rootScope.$new();
                    spyOn($scope,'$on').andCallFake(function(e,h){
                        if (!$scope._on){
                            $scope._on = {};
                        }
                        $scope._on[e] = h;
                    });

                    createAppCtrl = function(){
                        AppCtrl = $controller('AppController', {
                            $location      : $location,
                            $log           : $log,
                            $scope         : $scope,
                            appData        : appData,
                            auth           : auth,
                            c6Defines      : c6Defines,
                            c6LocalStorage : localStorage,
                            tracker        : tracker
                        });
                    };
                });
            });

            describe('initialization',function(){

                it('should exist',function() {
                    createAppCtrl();
                    expect(AppCtrl).toBeDefined();
                });

                it('should be on the scope',function(){
                    createAppCtrl();
                    expect($scope.AppCtrl).toBe(AppCtrl);
                });

                it('should attempt to get a user from local storage',function(){
                    createAppCtrl();
                    expect(localStorage.get).toHaveBeenCalledWith('user'); 
                });

                it('should create the tracker',function(){
                    createAppCtrl();
                    expect(tracker.create).toHaveBeenCalled(); 
                });

                describe('checkAuthStatus',function(){
                    beforeEach(function(){
                        mockUser = {
                            id : 'user1',
                            applications : ['app1','app2','app3']
                        }
                        localStorage.get.andReturn(mockUser);
                        createAppCtrl();
                    });

                    it('should be checked if a user is found in storage',function(){
                        expect($scope.user).toBe(mockUser);
                        expect(appData.user).toBe(mockUser);
                        expect(auth.checkStatus).toHaveBeenCalled();
                    });

                    it('success should update user and move to experience',function(){
                        var newUser = { id : 'new'};
                        spyOn(AppCtrl,'updateUser');
                        auth.checkStatus.deferred.resolve(newUser);
                        $scope.$apply();
                        expect(AppCtrl.updateUser).toHaveBeenCalledWith(newUser);
                        expect($location.path).toHaveBeenCalledWith('/apps');
                    });

                    it('failure should update user to null and move to login',function(){
                        spyOn(AppCtrl,'updateUser');
                        auth.checkStatus.deferred.reject({});
                        $scope.$apply();
                        expect(AppCtrl.updateUser).toHaveBeenCalledWith(null);
                        expect($location.path).toHaveBeenCalledWith('/login');
                    });
                });
            });


            describe('updateUser',function(){
                beforeEach(function(){
                    createAppCtrl();
                });

                describe('with user === null',function(){
                    it('will remove user from localstorage',function(){
                        AppCtrl.updateUser(null);
                        expect(localStorage.remove).toHaveBeenCalledWith('user');
                    });
                    
                    it('will set $scope.user = null',function(){
                        AppCtrl.updateUser(null);
                        expect($scope.user).toBeNull();
                    });
                    
                    it('will set appData.user = null, appData.app = null',function(){
                        AppCtrl.updateUser(null);
                        expect(appData.user).toBeNull();
                        expect(appData.app).toBeNull();
                    });
                });
                
                describe('with user === undefined',function(){
                    it('will remove user from localstorage',function(){
                        AppCtrl.updateUser(undefined);
                        expect(localStorage.remove).toHaveBeenCalledWith('user');
                    });
                    
                    it('will set $scope.user = null',function(){
                        AppCtrl.updateUser(undefined);
                        expect($scope.user).toBeNull();
                    });
                    
                    it('will set appData.user = null, appData.app = null',function(){
                        AppCtrl.updateUser(undefined);
                        expect(appData.user).toBeNull();
                        expect(appData.app).toBeNull();
                    });
                });
                
                describe('with user === user', function(){
                    beforeEach(function(){
                        mockUser = {
                            id           : 'howard1',
                            applications : [ 'e1' ]
                        };
                    });

                    it('will add user to localstorage',function(){
                        AppCtrl.updateUser(mockUser);
                        expect(localStorage.set).toHaveBeenCalledWith('user',mockUser);
                    });

                    it('will set $scope.user to new user',function(){
                        $scope.user = null;
                        AppCtrl.updateUser(mockUser);
                        expect($scope.user).toBe(mockUser);
                    });

                    it('will set currentApp with first app if it has any',function(){
                        mockUser.applications = ['app1','app2'];
                        AppCtrl.updateUser(mockUser);
                        expect(mockUser.currentApp).toEqual('app1');
                    });

                    it('will set userData based on user settings',function(){
                        appData.user = null;
                        appData.app = null;
                        AppCtrl.updateUser(mockUser);
                        expect(appData.user).toBe(mockUser);
                        expect(appData.app).toEqual('e1');
                    });

                });
            });

            describe('logout',function(){
                var mockEvent, logout;
                beforeEach(function(){
                    createAppCtrl();

                    spyOn(AppCtrl,'updateUser');
                });

                it('should trigger a user update and route to /login if resolves',function(){
                    AppCtrl.logout();
                    auth.logout.deferred.resolve();
                    $scope.$apply();
                    expect(AppCtrl.updateUser).toHaveBeenCalledWith(null);
                    expect($location.path).toHaveBeenCalledWith('/login');
                });
                
                it('should trigger a user update and route to /login if rejects',function(){
                    AppCtrl.logout();
                    auth.logout.deferred.reject();
                    $scope.$apply();
                    expect(AppCtrl.updateUser).toHaveBeenCalledWith(null);
                    expect($location.path).toHaveBeenCalledWith('/login');
                });
            });

            describe('$scope.$on($locationChangeStart)',function(){
                var mockEvent, $locationChangeStart;
                beforeEach(function(){
                    mockUser = {
                        id : 'user',
                        applications : [ 'app1' ]
                    };
                    mockEvent = {
                        preventDefault : jasmine.createSpy('event.preventDefault')
                    };

                    createAppCtrl();

                    $locationChangeStart = $scope._on['$locationChangeStart'];
                });

                it('should have a listener',function(){
                    expect($locationChangeStart).toBeDefined();
                });

                it('url === /apps with $scope.users set',function(){
                    $scope.user = mockUser;
                    $locationChangeStart(mockEvent,'/apps',null);
                    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
                });

                it('url === /apps with $scope.users not set',function(){
                    $scope.user = null;
                    $locationChangeStart(mockEvent,'/apps',null);
                    $timeout.flush();
                    expect(mockEvent.preventDefault).toHaveBeenCalled();
                    expect($location.path).toHaveBeenCalledWith('/login');
                });

            });
            
            describe('$scope.$on(loginSuccess)',function(){
                var mockEvent, loginSuccess;
                beforeEach(function(){
                    mockUser = {
                        id : 'user',
                        applications : [ 'app1' ]
                    };
                    mockEvent = {
                        preventDefault : jasmine.createSpy('event.preventDefault')
                    };

                    createAppCtrl();

                    spyOn(AppCtrl,'updateUser');

                    loginSuccess = $scope._on['loginSuccess'];
                });

                it('should have a listener',function(){
                    expect(loginSuccess).toBeDefined();
                });

                it('should trigger a user update',function(){
                    loginSuccess(mockEvent,mockUser);
                    expect(AppCtrl.updateUser).toHaveBeenCalledWith(mockUser);
                    expect($location.path).toHaveBeenCalledWith('/apps');
                });
            });
            
        });
    });
}());
