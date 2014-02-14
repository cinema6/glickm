(function(window$){
    /* jshint -W106 */
    'use strict';

    angular.module('c6.glickm', window$.c6.kModDeps)
        .constant('c6Defines', window$.c6)
        .config(['$provide',
        function( $provide ) {
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
                ],
                googleAnalytics: 'ga'
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
        }])
        .config(['c6UrlMakerProvider', 'c6Defines',
        function( c6UrlMakerProvider ,  c6Defines ) {
            c6UrlMakerProvider.location(c6Defines.kBaseUrl,'default');
            c6UrlMakerProvider.location(c6Defines.kVideoUrls[(function() {
                return 'local';
            }())] ,'video');
        }])
        .config(['$routeProvider','c6UrlMakerProvider',
        function($routeProvider,c6UrlMakerProvider){
            $routeProvider
            .when('/experience',{
                templateUrl     : c6UrlMakerProvider.makeUrl('views/experience.html')
            })
            .otherwise({
                controller      : 'LoginCtrl',
                templateUrl     : c6UrlMakerProvider.makeUrl('views/login.html')
            });
        }])
        .config(['c6AuthProvider', function(c6AuthProvider){
            c6AuthProvider.baseUrl = '';
        }])
        .controller('AppController',
            ['$scope', '$log', '$location', '$timeout','cinema6', 'gsap', 'c6LocalStorage',
            function ( $scope ,  $log , $location,  $timeout, cinema6 ,  gsap, c6LocalStorage ) {
            var self = this;

            $log = $log.context('AppCtrl');

            $log.info('loaded.');

            cinema6.init({
                setup: function(appData) {
                    self.experience = appData.experience;
                    self.profile = appData.profile;

                    gsap.TweenLite.ticker.useRAF(self.profile.raf);
                }
            });

            $scope.$on('$locationChangeStart',function(evt,newUrl,oldUrl){
                $log.info('$location origin: ',window.location.origin);
                $log.info('locationChange: %1 ===> %2', oldUrl, newUrl);
                if ((!newUrl.match(/\/login/)) && (!$scope.user)){
                    evt.preventDefault();
                    $timeout(function(){
                        $location.path('/login').replace();
                    });
                }
            });

            $scope.$on('loginSuccess',function(evt,user){
                $log.info('Login succeeded, new user:',user);
                c6LocalStorage.set('user',user);
                $scope.user = user;
                $location.path('/experience').replace();
            });

            $scope.$on('logout',function(){
                $log.info('Logout user:',$scope.user);
                $scope.user = null;
                c6LocalStorage.remove('user');
                $location.path('/login');
            });
                
            $scope.user = c6LocalStorage.get('user');

        }]);
}(window));
