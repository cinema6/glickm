(function(){

    define(['experience','templates' ], function() {
        describe('c6-experience',function(){
            var $rootScope,
                $scope,
                $compile,
                $log,
                $exp,
                c6UrlMaker,
                c6Defines,
                $timeout,
                $iframe,
                experience,
                createDirective;
        
            beforeEach(function() {
                c6Defines = { kTracker : { config : {} } };
                
                experience = {
                    appUri          : 'appUri1',
                    appUriPrefix    : 'appUriPrefix',
                    uri             : 'uri1',
                    id              : 'e1'
                };

                createDirective = function(){
                    module('c6.glickm', ['$provide', function($provide) {
                        $log = {
                            context : jasmine.createSpy('$log.context'),
                            info    : jasmine.createSpy('$log.info')
                        };
                        $log.context.andReturn($log);

                        $provide.provider('$log', function(){
                            this.$get     = function(){
                                return $log;
                            };
                        });

                        $provide.constant('c6Defines',c6Defines);
                       
                        c6UrlMaker = jasmine.createSpy('c6UrlMaker').andReturn('/test');
                        $provide.provider('c6UrlMaker', function(){
                            this.$get     = function(){ return c6UrlMaker; };
                        });
                    
                    }]);

                    inject(function($injector) {
                        $rootScope = $injector.get('$rootScope');
                        $compile = $injector.get('$compile');
                        $timeout = $injector.get('$timeout');
                        $scope = $rootScope.$new();
                    });

                    $iframe = [ { contentWindow : {} } ];
                    $iframe.on = jasmine.createSpy('$iframe.on').andCallFake(function(e,h){
                        if (e === 'load'){
                            $iframe.__onLoad = h;
                        }
                    });
                    $iframe.off = jasmine.createSpy('$iframe.off');

                    $scope.experience = experience;

                    spyOn(angular,'element').andReturn($iframe);

                    $scope.$apply(function() {
                        $exp = $compile('<c6-experience></c6-experience>')($scope);
                    });
                    $('body').append($exp);
                };
            });

            it('should form a url with appUri/appUriPrefix if c6Defines.kEnv == dev',function(){
                c6Defines.kEnv = 'dev';
                createDirective();
                expect(c6UrlMaker).toHaveBeenCalledWith('appUri1/appUriPrefix','exp');
            });
       
            it('should form a url with appUri/ if c6Defines.kEnv !== dev',function(){
                createDirective();
                expect(c6UrlMaker).toHaveBeenCalledWith('appUri1/','exp');
            });
       
            it('should attempt to create an <iframe> with production config',function(){
                c6Defines = {
                    kEnv : 'production',
                    kDebug : false,
                    kTracker : {
                        accountId : 'abc',
                        config    : 'auto'
                    }
                };
                createDirective();
                expect(angular.element).toHaveBeenCalledWith('<iframe src="/test?kTracker=abc" width="100%" height="100%" class="ui__viewFrame"></iframe>');
            });

            it('should attempt to create an <iframe> with staging config',function(){
                c6Defines = {
                    kEnv : 'staging',
                    kDebug : true,
                    kTracker : {
                        accountId : 'abc',
                        config    : 'auto'
                    }
                };
                createDirective();
                expect(angular.element).toHaveBeenCalledWith('<iframe src="/test?kEnv=staging&kDebug=1&kTracker=abc" width="100%" height="100%" class="ui__viewFrame"></iframe>');
            });

            it('should attempt to create an <iframe> with dev config',function(){
                c6Defines = {
                    kEnv : 'dev',
                    kDebug : true,
                    kTracker : {
                        accountId : 'abc',
                        config    :  {
                            cookieDomain : 'none'
                        }
                    }
                };
                createDirective();
                expect(angular.element).toHaveBeenCalledWith('<iframe src="/test?kEnv=dev&kDebug=1&kTracker=abc:none" width="100%" height="100%" class="ui__viewFrame"></iframe>');
            });

            it('should listen for $iframe.on(load)',function(){
                createDirective();
                expect($iframe.__onLoad).toBeDefined();
            });

            it('should emit iframeReady when the iframe is loaded',function(){
                createDirective();
                spyOn($scope,'$emit');
                $iframe.__onLoad();
                $timeout.flush();
                expect($scope.$emit).toHaveBeenCalledWith('iframeReady',
                    $iframe[0].contentWindow);
            });

        });
    });

}());
