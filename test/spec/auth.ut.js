(function(){
    'use strict';

    define(['auth'], function() {

        describe('c6Auth', function() {
            var $httpBackend, $timeout, c6Auth, successSpy, failureSpy;

            beforeEach(function(){
                module('c6.glickm.services');

                inject(['$injector',function($injector){
                    c6Auth       = $injector.get('c6Auth');
                    $timeout     = $injector.get('$timeout');
                    $httpBackend = $injector.get('$httpBackend');
                }]);
                
            });

            describe('login method', function(){
                
                beforeEach(function(){
                    successSpy = jasmine.createSpy('login.success');
                    failureSpy = jasmine.createSpy('login.failure');
                    spyOn($timeout,'cancel');
                });
                
                it('will resolve promise if successfull',function(){
                    var mockUser = { id: 'userX' };
                    $httpBackend.expectPOST('/api/auth/login').respond(200,mockUser);
                    c6Auth.login('userX','foobar').then(successSpy,failureSpy);
                    $httpBackend.flush();
                    expect(successSpy).toHaveBeenCalledWith(mockUser);
                    expect(failureSpy).not.toHaveBeenCalled();
                    expect($timeout.cancel).toHaveBeenCalled();
                });

                it('will reject promise if not successfull',function(){
                    $httpBackend.expectPOST('/api/auth/login')
                        .respond(404,'Unable to find user.');
                    c6Auth.login('userX','foobar').then(successSpy,failureSpy);
                    $httpBackend.flush();
                    expect(successSpy).not.toHaveBeenCalled();
                    expect(failureSpy).toHaveBeenCalledWith('Unable to find user.');
                    expect($timeout.cancel).toHaveBeenCalled();
                });

                it('will reject promise if times out',function(){
                    $httpBackend.expectPOST('/api/auth/login').respond(200,{});
                    c6Auth.login('userX','foobar').then(successSpy,failureSpy);
                    $timeout.flush(60000);
                    expect(successSpy).not.toHaveBeenCalled();
                    expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                });
            
            });


            describe('logout', function(){
                beforeEach(function(){
                    successSpy = jasmine.createSpy('logout.success');
                    failureSpy = jasmine.createSpy('logout.failure');
                    spyOn($timeout,'cancel');
                });
                
                it('will resolve promise if successfull',function(){
                    $httpBackend.expectPOST('/api/auth/logout').respond(200,"Success");
                    c6Auth.logout().then(successSpy,failureSpy);
                    $httpBackend.flush();
                    expect(successSpy).toHaveBeenCalledWith("Success");
                    expect(failureSpy).not.toHaveBeenCalled();
                    expect($timeout.cancel).toHaveBeenCalled();
                });

                it('will reject promise if not successfull',function(){
                    var mockErr = { error : 'Error processing logout' };
                    $httpBackend.expectPOST('/api/auth/logout').respond(500,mockErr);
                    c6Auth.logout().then(successSpy,failureSpy);
                    $httpBackend.flush();
                    expect(successSpy).not.toHaveBeenCalled();
                    expect(failureSpy).toHaveBeenCalledWith(mockErr.error);
                    expect($timeout.cancel).toHaveBeenCalled();
                });

                it('will reject promise if times out',function(){
                    $httpBackend.expectPOST('/api/auth/logout').respond(200,{});
                    c6Auth.logout().then(successSpy,failureSpy);
                    $timeout.flush(60000);
                    expect(successSpy).not.toHaveBeenCalled();
                    expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                });
            });
        });

        describe('c6Auth Provider',function(){
            
            it('can configure the baseUrl', function(){
                module('c6.glickm.services', ['c6AuthProvider', function(provider){
                    provider.baseUrl = 'hoho';
                }]);
                inject(['$httpBackend','c6Auth', function($httpBackend,c6Auth){ 
                    $httpBackend.expectPOST('hoho/auth/login').respond(200,{});
                    c6Auth.login('userX','foobar');
                    $httpBackend.flush();
                }]);
            });
             
            it('can configure the timeout', function(){
                var timeoutSpy = jasmine.createSpy('$timeout');
                timeoutSpy.cancel = jasmine.createSpy('$timeout.cancel');

                module( 'c6.glickm.services', 
                        ['c6AuthProvider', function(c6AuthProvider){ 
                            c6AuthProvider.timeout = 10; 
                        }],
                        ['$provide',function($provide){
                            $provide.decorator('$timeout', function() { 
                                return timeoutSpy; 
                            });
                        }]
                );
                
                inject(['c6Auth', function(c6Auth){ 
                    c6Auth.login('userX','foobar');
                    expect(timeoutSpy.mostRecentCall.args[1]).toEqual(10);
                }]);
            });
        });
    });
}());

