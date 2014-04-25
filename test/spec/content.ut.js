(function(){
    'use strict';

    define(['content'], function() {

        describe('content', function() {
            var $httpBackend, $timeout, content, successSpy, failureSpy,
                c6UrlMaker;

            beforeEach(function(){
                module('c6.ui', ['$provide', function($provide) {
                    $provide.provider('c6UrlMaker', function(){
                        this.location = jasmine.createSpy('urlMaker.location');
                        this.makeUrl  = jasmine.createSpy('urlMaker.makeUrl');
                        this.$get     = function(){
                            return jasmine.createSpy('urlMaker.get');
                        };
                    });
                }]);
                module('c6.glickm');

                inject(['$injector',function($injector){
                    content      = $injector.get('content');
                    $timeout     = $injector.get('$timeout');
                    $httpBackend = $injector.get('$httpBackend');
                    c6UrlMaker   = $injector.get('c6UrlMaker');
                }]);
                
                spyOn($timeout,'cancel');
            });

            describe('content.getExperience',function(){
                beforeEach(function(){
                    successSpy = jasmine.createSpy('login.success');
                    failureSpy = jasmine.createSpy('login.failure');
                    c6UrlMaker.andReturn('/api/content/experience/e-1'); 
                });

                it('will resolve promise if successfull',function(){
                    var mockExperience = { id: 'e-1' };
                    $httpBackend.expectGET('/api/content/experience/e-1')
                        .respond(200,mockExperience);
                    content.getExperience('e-1').then(successSpy,failureSpy);
                    $httpBackend.flush();
                    expect(successSpy).toHaveBeenCalledWith(mockExperience);
                    expect(failureSpy).not.toHaveBeenCalled();
                    expect($timeout.cancel).toHaveBeenCalled();
                });
                
                it('will reject promise if not successful',function(){
                    $httpBackend.expectGET('/api/content/experience/e-1')
                        .respond(404,'Unable to find user.');
                    content.getExperience('e-1').then(successSpy,failureSpy);
                    $httpBackend.flush();
                    expect(successSpy).not.toHaveBeenCalled();
                    expect(failureSpy).toHaveBeenCalledWith('Unable to find user.');
                    expect($timeout.cancel).toHaveBeenCalled();
                });
                
                it('will reject promise if times out',function(){
                    $httpBackend.expectGET('/api/content/experience/e-1')
                        .respond(200,'');
                    content.getExperience('e-1').then(successSpy,failureSpy);
                    $timeout.flush(60000);
                    expect(successSpy).not.toHaveBeenCalled();
                    expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                });

            });
        });
    });
}());

