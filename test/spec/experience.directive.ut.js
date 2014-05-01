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
                $frameDoc,
                $frameBody,
                $window,
                $document,
                chrome,
                experience,
                createDirective;

            var jqLite = angular.element;
        
            beforeEach(function() {
                c6Defines = { kTracker : { config : {} } };

                chrome = [
                    jqLite('<div class="chrome" style="height: 25px; margin: 5px 0; padding: 2px;"></div>'),
                    jqLite('<div class="chrome" style="height: 40px;"></div>')
                ];

                chrome.forEach(function(piece) {
                    var $piece = jqLite(piece);

                    $piece.appendTo('body');
                });
                
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
                        $window = $injector.get('$window');
                        $scope = $rootScope.$new();
                    });

                    $iframe = [ { contentWindow : {} } ];
                    $iframe.on = jasmine.createSpy('$iframe.on').andCallFake(function(e,h){
                        if (e === 'load'){
                            $iframe.__onLoad = h;
                        }
                    });
                    $iframe.off = jasmine.createSpy('$iframe.off');
                    $iframe.contents = function() {
                        return $frameDoc;
                    };
                    $iframe.height = jasmine.createSpy('$iframe.height()');

                    $scope.experience = experience;

                    spyOn(angular,'element').andCallFake(function(value) {
                        var actual = jqLite.apply(null, arguments);

                        function Selector() {}
                        Selector.prototype = actual;

                        if (angular.isString(value)) { return $iframe; }

                        return new Selector();
                    });

                    $frameBody = [];
                    $frameBody.outerHeight = jasmine.createSpy('$iframe $body height()')
                        .andReturn($window.innerHeight + 100);

                    $frameDoc = [];
                    $frameDoc.find = jasmine.createSpy('$iframe.contents().find()')
                        .andCallFake(function(matcher) {
                            if (matcher === 'body') {
                                return $frameBody;
                            }

                            return [];
                        });

                    $scope.$apply(function() {
                        $exp = $compile('<c6-experience></c6-experience>')($scope);
                    });
                    $('body').append($exp);

                    return $exp;
                };
            });

            afterEach(function() {
                chrome.forEach(function(piece) {
                    var $piece = jqLite(piece);

                    $piece.remove();
                });
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

            describe('when the resizeExperience event is $broadcast', function() {
                var $$window;

                beforeEach(function() {
                    $$window = jqLite($window);

                    createDirective();
                    $scope.$broadcast('resizeExperience');
                });

                it('should set the iframe\'s height to be the height of its body', function() {
                    $frameBody.outerHeight.andReturn($$window.height() + 500);
                    $scope.$broadcast('resizeExperience');
                    expect($iframe.height).toHaveBeenCalledWith($$window.height() + 500);
                });

                it('should not allow the iframe to be smaller than the window height - the height of the chrome', function() {
                    $frameBody.outerHeight.andReturn($$window.height() - 1000);
                    $scope.$broadcast('resizeExperience');
                    expect($iframe.height).toHaveBeenCalledWith($$window.height() - 79);
                });
            });

            describe('when the $window is resized', function() {
                var $$window;

                beforeEach(function() {
                    createDirective();
                    $$window = jqLite($window);

                    $$window.trigger('resize');
                });

                it('should set the iframe\'s height to be the height of its body', function() {
                    $frameBody.outerHeight.andReturn($window.innerHeight + 500);
                    $$window.trigger('resize');
                    expect($iframe.height).toHaveBeenCalledWith($window.innerHeight + 500);
                });

                it('should not allow the iframe to be smaller than the window height - the height of the chrome', function() {
                    $frameBody.outerHeight.andReturn($$window.height() - 1000);
                    $$window.trigger('resize');
                    expect($iframe.height).toHaveBeenCalledWith($$window.height() - 79);
                });
            });

            describe('when the element is removed', function() {
                beforeEach(function() {
                    createDirective();
                    $exp.remove();
                    jqLite($window).trigger('resize');
                });

                it('should remove its resize listener', function() {
                    expect($iframe.height).not.toHaveBeenCalled();
                });
            });
        });
    });

}());
