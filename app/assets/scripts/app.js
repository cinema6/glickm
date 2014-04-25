(function(window$){
    /* jshint -W106 */
    'use strict';

    angular.module('c6.glickm', window$.c6.kModDeps)
        .constant('c6Defines', window$.c6)
        .config(['$provide', function( $provide ) {
            var config = {
                modernizr: 'Modernizr',
                gsap: [
                    'TimelineLite',
                    'TimelineMax',
                    'TweenLite',
                    'TweenMax',
                    'Back',
                    'Bounce',
                    'Circ',
                    'Cubic',
                    'Ease',
                    'EaseLookup',
                    'Elastic',
                    'Expo',
                    'Linear',
                    'Power0',
                    'Power1',
                    'Power2',
                    'Power3',
                    'Power4',
                    'Quad',
                    'Quart',
                    'Quint',
                    'RoughEase',
                    'Sine',
                    'SlowMo',
                    'SteppedEase',
                    'Strong'
                ]
            };

            angular.forEach(config, function(value, key) {
                if (angular.isString(value)) {
                    $provide.value(key, window[value]);
                } else if (angular.isArray(value)) {
                    $provide.factory(key, function() {
                        var service = {};

                        angular.forEach(value, function(global) {
                            service[global] = window[global];
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
            c6UrlMakerProvider.location(c6Defines.kBaseUrl,'default');
            c6UrlMakerProvider.location(c6Defines.kCollateralUrl,'collateral');
            c6UrlMakerProvider.location(c6Defines.kApiUrl ,'api');
            c6UrlMakerProvider.location(c6Defines.kExpUrl ,'exp');
        }])
        .config(['$routeProvider','c6UrlMakerProvider',
        function($routeProvider,c6UrlMakerProvider){
            var getExperience = function(appData,content){
                return content.getExperience(appData.app);
            };
            getExperience.$inject = ['appData','content'];

            $routeProvider
            .when('/experience',{
                controller   : 'ExperienceCtrl',
                controllerAs : 'ExperienceCtrl',
                templateUrl  : c6UrlMakerProvider.makeUrl('views/experience.html'),
                resolve      : {
                    experience  :  getExperience
                }
            })
            .otherwise({
                controller   : 'LoginCtrl',
                templateUrl  : c6UrlMakerProvider.makeUrl('views/login.html')
            });
        }])
        .value('appData',{ user : null, app : null})
        .controller('AppController',
            ['$scope', '$log', '$location', '$timeout',
                'c6LocalStorage', 'auth', 'content', 'appData',
            function ( $scope ,  $log , $location,  $timeout,
                c6LocalStorage, auth, content, appData) {
            var self = this;
            $log = $log.context('AppCtrl');
            $log.info('loaded.');
            
            self.updateUser = function(rec, skipStore){
                if (rec){
                    if (rec.applications.length === 1){
                        rec.currentApp = rec.applications[0];
                    }
                    if (!skipStore){
                        c6LocalStorage.set('user',rec);
                    }
                } else {
                    c6LocalStorage.remove('user');
                }
                appData.user = $scope.user = rec;
                appData.app  = (rec) ? rec.currentApp : null;
                return rec;
            };

            $scope.$on('$locationChangeStart',function(evt,newUrl,oldUrl){
                $log.info('$location origin: ',window.location.origin);
                $log.info('locationChange: %1 ===> %2', oldUrl, newUrl);
                var isLogin = !!newUrl.match(/\/login/);
                if ((!isLogin) && (!$scope.user)){
                    evt.preventDefault();
                    $timeout(function(){
                        $location.path('/login').replace();
                    });
                    return;
                }
            });

            $scope.$on('loginSuccess',function(evt,user){
                $log.info('Login succeeded, new user:',user);
                self.updateUser(user);
                $location.path('/experience').replace();
            });

            $scope.$on('logout',function(){
                $log.info('Logout user:',$scope.user);
                self.updateUser(null);
                $location.path('/login');
            });
                
            self.updateUser(c6LocalStorage.get('user'),true);
            if ($scope.user){
                auth.checkStatus()
                .then(function(user){
                    $log.info('auth check passed: ',user);
                    self.updateUser(user);
                    $location.path('/experience').replace();
                },
                function(err){
                    $log.info('auth check failed: ',err);
                    self.updateUser(null);
                    $location.path('/login');
                });
            }

        }]);
}(window));
