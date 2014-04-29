(function(window$){
    /* jshint -W106 */
    'use strict';

    angular.module('c6.glickm', window$.c6.kModDeps)
        .constant('c6Defines', window$.c6)
        .config(['$provide', function( $provide ) {
            var config = {
                modernizr: 'Modernizr'
            };

            angular.forEach(config, function(value, key) {
                if (angular.isString(value)) {
                    $provide.value(key, window$[value]);
                } else if (angular.isArray(value)) {
                    $provide.factory(key, function() {
                        var service = {};
                        angular.forEach(value, function(global) {
                            service[global] = window$[global];
                        });
                        return service;
                    });
                }
            });

            if (window$.c6HttpDecorator){
                $provide.decorator('$http', ['$delegate', window$.c6HttpDecorator]);
            }
        
        }])
        .config(['c6UrlMakerProvider', 'c6Defines',
        function( c6UrlMakerProvider ,  c6Defines ) {
            c6UrlMakerProvider.location(c6Defines.kBaseUrl,         'default');
            c6UrlMakerProvider.location(c6Defines.kApiUrl,          'api');
            c6UrlMakerProvider.location(c6Defines.kExpUrl,          'exp');
        }])
        .config(['$routeProvider','c6UrlMakerProvider',
        function($routeProvider,c6UrlMakerProvider){
            var getExperience = function(appData,content){
                return content.getExperience(appData.app);
            };
            getExperience.$inject = ['appData','content'];

            $routeProvider
            .when('/apps',{
                controller   : 'ExperienceCtrl',
                controllerAs : 'ExperienceCtrl',
                template     : '<c6-experience></c6-experience>',
                resolve      : {
                    experience  :  getExperience
                }
            })
            .when('/account',{
                controller   : 'AccountCtrl',
                controllerAs : 'AcctCtrl',
                templateUrl  : c6UrlMakerProvider.makeUrl('views/account.html')
            })
            .when('/login',{
                controller   : 'LoginCtrl',
                controllerAs : 'LoginCtrl',
                templateUrl  : c6UrlMakerProvider.makeUrl('views/login.html')
            })
            .when('/error',{
                controller   : 'ErrorCtrl',
                controllerAs : 'ErrorCtrl',
                templateUrl  : c6UrlMakerProvider.makeUrl('views/error.html')
            })
            .when('/',{
                redirectTo   : '/apps'
            })
            .otherwise({
                redirectTo   : '/error'
            });
        }])
        .value('appData',{ user : null, app : null})
        .controller('AppController',
            [   '$scope', '$log', '$location', '$timeout',
                'c6Defines','c6LocalStorage', 'auth', 'content', 'appData', 'tracker',
                'lastError',
            function (  $scope ,  $log , $location,  $timeout,
                        c6Defines,c6LocalStorage, auth, content, appData, tracker,
                        lastError) {

            var self = this;
            self.entryPath = $location.path();
            $log = $log.context('AppCtrl');
            $log.info('instantiated, scope=%1, entry=%2',$scope.$id, self.entryPath);
            $scope.AppCtrl = this;
            /**
             * Controller methods
             */

            self.goto = function(path){
                $log.info('goto request:',path);
                if ((path !== '/error') && (lastError.getCount())) {
                    $location.path('/error');
                    return;
                }
                $location.path(path);
            };

            self.updateUser = function(rec, skipStore){
                if (rec){
                    if (rec.applications === undefined){
                        rec.applications = [];
                    }
                    if (rec.applications.length >= 1){
                        rec.currentApp = rec.applications[0];
                    } else {
                        lastError.set('No applications for user: ' + rec.username,500);
                    }
                    if (!skipStore){
                        c6LocalStorage.set('user',rec);
                    }
                } else {
                    c6LocalStorage.remove('user');
                }
                appData.user = $scope.user = (rec || null);
                appData.app  = (rec) ? rec.currentApp : null;
                return rec;
            };
            
            self.logout = function(){
                $log.info('logging out');
                auth.logout()
                ['finally'](function(result){
                    $log.info('log out returns:',result);
                    $log.info('Logout user:',$scope.user);
                    self.updateUser(null);
                    self.goto('/login');
                });
            };

            /**
             * Setup
             */
            self.updateUser(c6LocalStorage.get('user'),true);

            if ($scope.user){
                $log.info('checking authStatus');
                auth.checkStatus()
                .then(function(user){
                    $log.info('auth check passed: ',user);
                    self.updateUser(user);
                    self.goto(self.entryPath || '/apps');
                },
                function(err){
                    $log.info('auth check failed: ',err);
                    self.updateUser(null);
                    self.goto('/login');
                });
            }
            
            /**
             * Event listeners
             */
            $scope.$on('$locationChangeStart',function(evt,newUrl,oldUrl){
                $log.info('locationChange: %1 ===> %2', oldUrl, newUrl);
                var isLogin = !!newUrl.match(/\/login/);
                if ((!isLogin) && (!$scope.user)){
                    evt.preventDefault();
                    $timeout(function(){
                        self.goto('/login');
                    });
                    return;
                }
            });

            $scope.$on('loginSuccess',function(evt,user){
                $log.info('Login succeeded, new user:',user);
                self.updateUser(user);
                self.goto('/apps');
            });

            
            /**
             * Setup our tracking
             */
            $log.info('Initialize tracker with:',c6Defines.kTracker);
            tracker.create(c6Defines.kTracker.accountId,c6Defines.kTracker.config);
        }]);
}(window));
