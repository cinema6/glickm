(function(){
    'use strict';

    define(['account', 'templates'], function() {
        describe('AcctChangeCtrl', function() {
            var $rootScope,
                $scope,
                $log,
                $q,
                account,
                tracker,
                successSpy,
                failureSpy,
                ctrl,
                createController;

            beforeEach(function() {
                tracker = {
                    pageview :  jasmine.createSpy('tracker.pageview')
                };

                account = {
                    changePassword : jasmine.createSpy('account.changePassword'),
                    changeUsername : jasmine.createSpy('account.changeUsername')
                };
               
                module('c6.glickm');

                inject(function($injector, $controller ) {
                    $q          = $injector.get('$q');
                    $log        = $injector.get('$log');
                    $rootScope  = $injector.get('$rootScope');
                    $scope      = $rootScope.$new();
                    
                    $log.context = function(){ return $log; }

                    createController = function(){
                        ctrl = $controller('AcctChangeCtrl', {
                            $scope          : $scope,
                            $log            : $log,
                            account         : account,
                            tracker         : tracker
                        });
                    };
                });
            });
            describe('changeUsername',function(){
                beforeEach(function(){
                    successSpy = jasmine.createSpy('changeUsername.success');
                    failureSpy = jasmine.createSpy('changeUsername.failure');
                    createController();
                });
                it('will resolve a promise if success',function(){
                    account.changeUsername.andReturn($q.when('Success'));
                    ctrl.changeUsername('how','pass','how2')
                        .then(successSpy,failureSpy);
                    $scope.$digest();
                    expect(account.changeUsername).toHaveBeenCalledWith('how','pass','how2');
                    expect(successSpy).toHaveBeenCalledWith('Success');
                });
                it('will reject a promise if fails',function(){
                    account.changeUsername.andReturn($q.reject('Failed!'));
                    ctrl.changeUsername('how','pass','how2')
                        .then(successSpy,failureSpy);
                    $scope.$digest();
                    expect(account.changeUsername).toHaveBeenCalledWith('how','pass','how2');
                    expect(failureSpy).toHaveBeenCalledWith('Failed!');
                });
            });
            
            describe('changePassword',function(){
                beforeEach(function(){
                    successSpy = jasmine.createSpy('changePassword.success');
                    failureSpy = jasmine.createSpy('changePassword.failure');
                    createController();
                });
                it('will resolve a promise if success',function(){
                    account.changePassword.andReturn($q.when('Success'));
                    ctrl.changePassword('how','pass','how2')
                        .then(successSpy,failureSpy);
                    $scope.$digest();
                    expect(account.changePassword).toHaveBeenCalledWith('how','pass','how2');
                    expect(successSpy).toHaveBeenCalledWith('Success');
                });
                it('will reject a promise if fails',function(){
                    account.changePassword.andReturn($q.reject('Failed!'));
                    ctrl.changePassword('how','pass','how2')
                        .then(successSpy,failureSpy);
                    $scope.$digest();
                    expect(account.changePassword).toHaveBeenCalledWith('how','pass','how2');
                    expect(failureSpy).toHaveBeenCalledWith('Failed!');
                });
            });
        });
    });
}());
