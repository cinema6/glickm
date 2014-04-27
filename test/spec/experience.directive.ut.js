(function(){

    define(['experience','templates' ], function() {
        describe('c6-experience',function(){
            var $rootScope,
                $scope,
                $compile,
                $log,
                $exp,
                c6UrlMaker,
                $timeout,
                $iframe,
                experience;
        
            beforeEach(function() {
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


                experience = {
                    appUri          : 'appUri1',
                    appUriPrefix    : 'appUriPrefix',
                    uri             : 'uri1',
                    id              : 'e1'
                };

                $scope.experience = experience;

                spyOn(angular,'element').andReturn($iframe);

                $scope.$apply(function() {
                    $exp = $compile('<c6-experience></c6-experience>')($scope);
                });
                $('body').append($exp);
            });


            it('should form a url with appUri/appUriPrefix from experience',function(){
                expect(c6UrlMaker).toHaveBeenCalledWith('appUri1/appUriPrefix','exp');
            });
       
            it('should attempt to create an <iframe>',function(){
                expect(angular.element).toHaveBeenCalledWith('<iframe src="/test"width="100%" height="100%" class="ui__viewFrame"></iframe>');
            });

            it('should listen for $iframe.on(load)',function(){
                expect($iframe.__onLoad).toBeDefined();
            });

            it('should emit iframeReady when the iframe is loaded',function(){
                spyOn($scope,'$emit');
                $iframe.__onLoad();
                $timeout.flush();
                expect($scope.$emit).toHaveBeenCalledWith('iframeReady',
                    $iframe[0].contentWindow);
            });

        });
    });

}());
