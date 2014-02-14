(function(){
    'use strict';

    define(['app', 'templates'], function() {
        describe('AppController', function() {
            var $rootScope,
                $log,
                $location,
                $scope,
                AppCtrl;

            var cinema6,
                localStorage,
                mockUser,
                gsap,
                googleAnalytics,
                appData,
                cinema6Session;

            beforeEach(function() {
                mockUser = { id: 1, username: 'howard' };

                gsap = {
                    TweenLite: {
                        ticker: {
                            useRAF: jasmine.createSpy('gsap.TweenLite.ticker.useRAF()')
                        }
                    }
                };

                googleAnalytics = jasmine.createSpy('googleAnalytics');

                appData = {
                    experience: {
                        img: {}
                    },
                    profile: {
                        raf: {}
                    }
                };

                module('c6.ui', function($provide) {
                    $provide.factory('cinema6', function($q) {
                        cinema6 = {
                            init:       jasmine.createSpy('cinema6.init()'),
                            getSession: jasmine.createSpy('cinema6.getSiteSession()')
                                .andCallFake(function() {
                                    return cinema6._.getSessionResult.promise;
                                }),
                            _: {
                                getSessionResult: $q.defer()
                            }
                        };
                        return cinema6;
                    });

                    $provide.factory('c6LocalStorage', function(){
                        localStorage = {
                            set : jasmine.createSpy('localStorage.set'),
                            get : jasmine.createSpy('localStorage.get').andReturn(mockUser),
                            remove : jasmine.createSpy('localStorage.remove')
                        };
                        return localStorage;
                    });

                    $provide.factory('$location',function(){
                        $location = {
                            path : jasmine.createSpy('$location.path')
                                .andReturn( { replace : function(){} })
                        };

                        return $location;
                    });
                });

                module('c6.glickm', function($provide) {
                    $provide.value('gsap', gsap);
                    $provide.value('googleAnalytics', googleAnalytics);
                });

                inject(function($injector, $controller, c6EventEmitter) {
                    $rootScope = $injector.get('$rootScope');
                    $log       = $injector.get('$log');
                    
                    $log.context = function(){ return $log; }

                    $scope = $rootScope.$new();
                    AppCtrl = $controller('AppController', {
                        $scope: $scope,
                        $log: $log
                    });

                    cinema6Session = c6EventEmitter({});
                });
            });

            it('should exist',function() {
                expect(AppCtrl).toBeDefined();
            });

            describe('user', function(){
                it('will be pulled from localstorage at initialization',function(){
                    expect(localStorage.get).toHaveBeenCalledWith('user');
                    expect($scope.user).toEqual(mockUser);
                });

                it('will be updated when login succeeds',function(){
                    var newUser = { id : 2, username: 'fudegy' };
                    expect($scope.user).toEqual(mockUser);
                    $scope.$emit('loginSuccess',newUser);
                    expect($scope.user).toEqual(newUser);
                    expect(localStorage.set).toHaveBeenCalledWith('user',newUser);
                    expect($location.path).toHaveBeenCalledWith('/experience');
                });

                it('will be cleared when logout occurs',function(){
                    expect($scope.user).toEqual(mockUser);
                    $scope.$emit('logout');
                    expect($scope.user).toBeNull();
                    expect(localStorage.remove).toHaveBeenCalledWith('user');
                    expect($location.path).toHaveBeenCalledWith('/login');
                });
            });

            describe('cinema6 integration', function() {
                beforeEach(function() {
                    cinema6.init.mostRecentCall.args[0].setup(appData);
                });

                it('should initialize a session with cinema6', function() {
                    expect(cinema6.init).toHaveBeenCalled();
                });

                it('should setup the session', function() {
                    expect(AppCtrl.experience).toBe(appData.experience);
                    expect(AppCtrl.profile).toBe(appData.profile);
                });

                it('should configure gsap', function() {
                    expect(gsap.TweenLite.ticker.useRAF).toHaveBeenCalledWith(appData.profile.raf);
                });
            });
        });
    });
}());
