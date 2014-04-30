(function(){
    'use strict';

    define(['account'], function() {

        describe('account', function() {
            var $httpBackend, $timeout, account, successSpy, failureSpy,
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
                    account      = $injector.get('account');
                    $timeout     = $injector.get('$timeout');
                    $httpBackend = $injector.get('$httpBackend');
                    c6UrlMaker   = $injector.get('c6UrlMaker');
                }]);
                
            });

            describe('changeUsername method', function(){
                
                beforeEach(function(){
                    successSpy = jasmine.createSpy('changeUsername.success');
                    failureSpy = jasmine.createSpy('changeUsername.failure');
                    spyOn($timeout,'cancel');
                    c6UrlMaker.andReturn('/api/account/user/username'); 
                });
                
                it('will resolve promise if successfull',function(){
                    $httpBackend.expectPOST('/api/account/user/username')
                        .respond(200,'Successfully changed username');
                    account.changeUsername('userX','foobar','usery')
                        .then(successSpy,failureSpy);
                    $httpBackend.flush();
                    expect(successSpy).toHaveBeenCalledWith('Successfully changed username');
                    expect(failureSpy).not.toHaveBeenCalled();
                    expect($timeout.cancel).toHaveBeenCalled();
                });

                it('will reject promise if not successful',function(){
                    $httpBackend.expectPOST('/api/account/user/username')
                        .respond(400,'Unable to find user.');
                    account.changeUsername('userX','foobar','xx')
                        .then(successSpy,failureSpy);
                    $httpBackend.flush();
                    expect(successSpy).not.toHaveBeenCalled();
                    expect(failureSpy).toHaveBeenCalledWith('Unable to find user.');
                    expect($timeout.cancel).toHaveBeenCalled();
                });

                it('will reject promise if times out',function(){
                    $httpBackend.expectPOST('/api/account/user/username')
                        .respond(200,{});
                    account.changeUsername('userX','foobar','x')
                        .then(successSpy,failureSpy);
                    $timeout.flush(60000);
                    expect(successSpy).not.toHaveBeenCalled();
                    expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                });

            });

            describe('changePassword', function(){
                beforeEach(function(){
                    successSpy = jasmine.createSpy('changePassword.success');
                    failureSpy = jasmine.createSpy('changePassword.failure');
                    spyOn($timeout,'cancel');
                    c6UrlMaker.andReturn('/api/account/user/password'); 
                });
                
                it('will resolve promise if successfull',function(){
                    $httpBackend.expectPOST('/api/account/user/password')
                        .respond(200,"Success");
                    account.changePassword('a','b','c')
                        .then(successSpy,failureSpy);
                    $httpBackend.flush();
                    expect(successSpy).toHaveBeenCalledWith("Success");
                    expect(failureSpy).not.toHaveBeenCalled();
                    expect($timeout.cancel).toHaveBeenCalled();
                });

                it('will reject promise if not successfull',function(){
                    $httpBackend.expectPOST('/api/account/user/password')
                        .respond(500,'There was an error.');
                    account.changePassword('a','b','c')
                        .then(successSpy,failureSpy);
                    $httpBackend.flush();
                    expect(successSpy).not.toHaveBeenCalled();
                    expect(failureSpy).toHaveBeenCalledWith('There was an error.');
                    expect($timeout.cancel).toHaveBeenCalled();
                });

                it('will reject promise if times out',function(){
                    $httpBackend.expectPOST('/api/account/user/password').respond(200,{});
                    account.changePassword('a','b','c')
                        .then(successSpy,failureSpy);
                    $timeout.flush(60000);
                    expect(successSpy).not.toHaveBeenCalled();
                    expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                });
                
            });
        });

    });
}());

