(function(){
    'use strict';

    define(['experience','templates' ], function() {
        var jqLite = angular.element;

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

            var $testWindow,
                $testDoc;
        
            beforeEach(function() {
                $testWindow = jqLite('<iframe src="about:blank" style="width: 800px; height: 600px;"></iframe>');
                $('body').append($testWindow);
                $testDoc = $testWindow.contents();
                $testDoc.find('body').css('margin', '0px');
                $window = $testWindow.prop('contentWindow');

                c6Defines = { kTracker : { config : {} } };

                chrome = [
                    jqLite('<div class="chrome header" style="height: 25px; margin: 5px 0; padding: 2px;"></div>'),
                    jqLite('<div class="chrome footer" style="height: 40px;"></div>')
                ];

                chrome.forEach(function(piece) {
                    var $piece = jqLite(piece);

                    $piece.appendTo($testDoc.find('body'));
                });
                
                experience = {
                    appUri          : 'appUri1',
                    appUriPrefix    : 'appUriPrefix',
                    uri             : 'uri1',
                    id              : 'e1'
                };

                module('ng', function($provide) {
                    $provide.value('$window', $testWindow[0].contentWindow);
                    $provide.value('$document', $testDoc);
                });

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
                        .andReturn(0);

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
                $testWindow.remove();
            });

            describe('when requestAvailableSpace is $broadcast', function() {
                var cb;

                function makeRequest() {
                    $rootScope.$broadcast('requestAvailableSpace', cb);
                    $timeout.flush();
                }

                beforeEach(function() {
                    cb = jasmine.createSpy('respond()');
                    $testDoc.find('.header').after(createDirective());
                });

                it('should respond with the available screen real estate, not including any chrome on the screen', function() {
                    makeRequest();
                    expect(cb).toHaveBeenCalledWith({ width: 800, height: 521 });
                });

                it('should not include any pixels of the chrome that is not on the screen', function() {
                    var $footer = chrome[1];

                    $footer.css({
                        position: 'fixed',
                        width: '100%',
                        bottom: '-20px'
                    });

                    makeRequest();
                    expect(cb).toHaveBeenCalledWith({ width: 800, height: 541 });
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

            it('should size the iframe to fill the window', function() {
                var $$window = jqLite($window);

                createDirective();
                expect($iframe.height).toHaveBeenCalledWith($$window.height() - 79);
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
                    expect($iframe.height.callCount).toBe(1);
                });
            });
        });
    });

}());
