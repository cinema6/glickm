(function(){
    'use strict';

    define(['app', 'templates'], function() {
        describe('AppController', function() {
            var $rootScope,
                $log,
                $q,
                $location,
                $scope,
                auth,
                AppCtrl;

            var localStorage,
                mockUser,
                gsap,
                googleAnalytics,
                appData;

            beforeEach(function() {
                mockUser = {
                    id: 1,
                    username: 'howard',
                    applications: ['e1'],
                    created:  '2013-02-03T12:23:24.345Z',
                    loggedIn: '2014-02-14T09:30:30.123Z'
                };

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

                module('c6.ui', ['$provide', function($provide) {
                    /*
                    $provide.provider('c6UrlMaker', function(){
                        this.location = jasmine.createSpy('urlMaker.location');
                        this.makeUrl  = jasmine.createSpy('urlMaker.makeUrl');
                        this.$get = jasmine.createSpy('urlMaker.get');
                    });
                    */

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
                }]);

                module('c6.glickm', function($provide) {
                    $provide.value('gsap', gsap);
                    $provide.value('googleAnalytics', googleAnalytics);
                });

                inject(function($injector, $controller, c6EventEmitter) {
                    $rootScope = $injector.get('$rootScope');
                    $log       = $injector.get('$log');
                    $q         = $injector.get('$q');
                    
                    $log.context = function(){ return $log; }
                    auth = {
                        login       : jasmine.createSpy('auth.login'),
                        logout      : jasmine.createSpy('auth.logout'),
                        checkStatus : jasmine.createSpy('auth.checkStatus'),
                        promise     : $q.defer().promise
                    };

                    auth.checkStatus.andReturn(auth.promise);

                    $scope = $rootScope.$new();
                    AppCtrl = $controller('AppController', {
                        $scope: $scope,
                        $log: $log,
                        auth: auth
                    });

                });
            });

            it('should exist',function() {
                expect(AppCtrl).toBeDefined();
            });

            describe('$scope.user', function(){
                describe('setting and unsetting',function(){
                    it('will be pulled from localstorage at initialization',function(){
                        expect(localStorage.get).toHaveBeenCalledWith('user');
                        expect($scope.user).toEqual(mockUser);
                        expect(mockUser.loggedIn instanceof Date).toEqual(true);
                        expect(mockUser.loggedIn.toISOString()).toEqual('2014-02-14T09:30:30.123Z');
                    });

                    it('will be updated when login succeeds',function(){
                        var newUser = { 
                            id : 2, 
                            applications: ['e2'],
                            username: 'fudgey',
                            created:  '2013-03-11T19:23:24.345Z' 
                        };
                        expect($scope.user).toEqual(mockUser);
                        $scope.$emit('loginSuccess',newUser);
                        expect($scope.user).toEqual(newUser);
                        expect(newUser.loggedIn instanceof Date).toEqual(true);
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

                describe('processUser',function(){

                    it('will convert date strings into date objects',function(){
                        var mockUser = {
                            id : 'abc',
                            created: '2013-01-02T12:23:22.123Z'
                        };


                    });

                });
            });

        });
    });
}());
