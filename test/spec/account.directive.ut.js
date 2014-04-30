(function(){
    'use strict';

    define(['account', 'templates'], function() {
        describe('account-change',function(){
            var $rootScope,
                $scope,
                $isolate,
                $compile,
                $log,
                $q,
                $element,
                $submit,
                c6UrlMaker,
                ctrl,
                createDirective,
                findSubmit;
        
            beforeEach(function() {
                createDirective = function(directiveName, email){
                    module('c6.glickm', ['$provide', '$controllerProvider',
                        function($provide,$controllerProvider) {
                        $submit = null;

                        $log = {
                            context : jasmine.createSpy('$log.context'),
                            info    : jasmine.createSpy('$log.info'),
                            warn    : jasmine.createSpy('$log.warn')
                        };
                        $log.context.andReturn($log);

                        $provide.provider('$log', function(){
                            this.$get     = function(){
                                return $log;
                            };
                        });

                        if (directiveName === 'change-email'){
                            c6UrlMaker = jasmine.createSpy('c6UrlMaker')
                                .andReturn('assets/views/change_email.html');
                        } else {
                            c6UrlMaker = jasmine.createSpy('c6UrlMaker')
                                .andReturn('assets/views/change_password.html');
                        }

                        $provide.provider('c6UrlMaker', function(){
                            this.$get     = function(){ return c6UrlMaker; };
                        });

                        $controllerProvider.register('AcctChangeCtrl',function(){
                            this.changeEmail = jasmine.createSpy('changeEmail');
                            this.changePassword = jasmine.createSpy('changePassword');
                            ctrl = this;
                        });
                    }]);

                    inject(function($injector) {
                        $q          = $injector.get('$q');
                        $rootScope  = $injector.get('$rootScope');
                        $compile    = $injector.get('$compile');
                        $scope      = $rootScope.$new();
                    });

                    $scope.user = {
                        email : email
                    };

                    $scope.$apply(function() {
                        $element = $compile( [
                            '<' + directiveName + ' email="{{user.email}}">',
                            '</' + directiveName + '>'
                        ].join())($scope);
                    });
                    $isolate = $element.isolateScope();
                    $('body').append($element);
                };

                findSubmit = function(){
                    var inputs = $element.find('input');
                    angular.forEach(inputs,function(input){
                        if (!$submit){
                            $submit = angular.element(input);
                            if ($submit.prop('type') !== 'submit'){
                                $submit = null;
                            }
                        }
                    });
                }

            });

            describe('change-email',function(){
                beforeEach(function(){
                    createDirective('change-email','howard@cinema6.com');
                });
                describe('form.$valid',function(){
                    it('is true if email and password are valid',function(){
                        $isolate.email = 'test-howard@somewhere.com';
                        $isolate.password = 'abcdefghijkl';
                        $isolate.$digest();
                        expect($isolate.theForm.$valid).toEqual(true);
                    });
                    
                    it('is false if email = ""',function(){
                        $isolate.email = '';
                        $isolate.password = 'abcdefghijkl';
                        $isolate.$digest();
                        expect($isolate.theForm.$valid).toEqual(false);
                        expect($isolate.theForm.email.$error.required).toEqual(true);
                    });
                    
                    it('is false if password not set',function(){
                        $isolate.email = 'not-howard@somewhere.com';
                        $isolate.password = null;
                        $isolate.$digest();
                        expect($isolate.theForm.$valid).toEqual(false);
                        expect($isolate.theForm.password.$error.required).toEqual(true);
                    });
                    
                    it('is false if email has leading spaces',function(){
                        $isolate.email = '  not-howard@somewhere.com';
                        $isolate.password = 'abcdefghijkl';
                        $isolate.$digest();
                        expect($isolate.theForm.$valid).toEqual(false);
                        expect($isolate.theForm.email.$error.pattern).toEqual(true);
                    });
                    
                    it('is false if email has trailing spaces',function(){
                        $isolate.email = 'not-howard@cinema6.com  ';
                        $isolate.password = 'abcdefghijkl';
                        $isolate.$digest();
                        expect($isolate.theForm.$valid).toEqual(false);
                        expect($isolate.theForm.email.$error.pattern).toEqual(true);
                    });

                    describe('ng-disabled set correctly',function(){
                        beforeEach(function(){
                            findSubmit();
                        });
                        it('ng-disabled turned off if everything is good',function(){
                            expect($submit.prop('disabled')).toEqual(true);
                            $isolate.email = 'not-howard@somewhere.com';
                            $isolate.password = 'abc';
                            $isolate.$digest();
                            expect($submit.prop('disabled')).toEqual(false);
                        });
                        
                        it('ng-disabled kept on if $valid = true, but usernames are same',function(){
                            expect($submit.prop('disabled')).toEqual(true);
                            $isolate.email = 'howard@cinema6.com';
                            $isolate.password = 'abc';
                            $isolate.$digest();
                            expect($submit.prop('disabled')).toEqual(true);
                        });
                    });

                    
                });

                describe('$scope.submit()',function(){
                    it('successful submit sets lastStatus',function(){
                        $isolate.email = 'not-howard   ';
                        $isolate.password = 'password';
                        ctrl.changeEmail.andReturn($q.when('hurray'));
                        expect($isolate.lastStatus).toBeNull();
                        $isolate.submit();
                        $isolate.$digest();
                        expect(ctrl.changeEmail)
                            .toHaveBeenCalledWith('howard@cinema6.com','password','not-howard');
                        expect($isolate.lastStatus).toEqual('User name has been changed.');
                    });

                    it('failed submit sets lastStatus',function(){
                        $isolate.email = 'not-howard';
                        $isolate.password = 'password';
                        ctrl.changeEmail.andReturn($q.reject('booo'));
                        expect($isolate.lastStatus).toBeNull();
                        $isolate.submit();
                        $isolate.$digest();
                        expect(ctrl.changeEmail)
                            .toHaveBeenCalledWith('howard@cinema6.com','password','not-howard');
                        expect($isolate.lastStatus).toEqual('User name change failed: booo');
                    });

                });
            });

            describe('change-password',function(){
                beforeEach(function(){
                    createDirective('change-password','howard@cinema6.com');
                });

                describe('form.$valid',function(){
                    it('is true if email and password are valid',function(){
                        $isolate.password[0] = 'abcdefghijkl';
                        $isolate.password[1] = 'abcdefghijkl';
                        $isolate.password[2] = 'abcdefghijkl';
                        $isolate.$digest();
                        expect($isolate.theForm.$valid).toEqual(true);
                    });
                    
                    it('is false if original password not set',function(){
                        $isolate.password[0] = null;
                        $isolate.password[1] = 'abcdefghijkl';
                        $isolate.password[2] = 'abcdefghijkl';
                        $isolate.$digest();
                        expect($isolate.theForm.$valid).toEqual(false);
                        expect($isolate.theForm.password0.$error.required).toEqual(true);
                    });
                    
                    it('is false if new password not set',function(){
                        $isolate.password[0] = 'abcdefghijkl';
                        $isolate.password[1] = null;
                        $isolate.password[2] = null;
                        $isolate.$digest();
                        expect($isolate.theForm.$valid).toEqual(false);
                        expect($isolate.theForm.password1.$error.required).toEqual(true);
                        expect($isolate.theForm.password2.$error.required).toEqual(true);
                    });
                    
                    it('is false if new password is too small',function(){
                        $isolate.password[0] = 'abcdefghijkl';
                        $isolate.password[1] = 'abc';
                        $isolate.password[2] = 'abc';
                        $isolate.$digest();
                        expect($isolate.theForm.$valid).toEqual(false);
                        expect($isolate.theForm.password1.$error.minlength).toEqual(true);
                    });
                    
                    it('is false if password has leading spaces',function(){
                        $isolate.password[0] = 'abcdefghijkl';
                        $isolate.password[1] = ' abcdefghijkl';
                        $isolate.password[2] = ' abcdefghijkl';
                        $isolate.$digest();
                        expect($isolate.theForm.$valid).toEqual(false);
                        expect($isolate.theForm.password1.$error.pattern).toEqual(true);
                    });
                    
                    it('is false if password has trailing spaces',function(){
                        $isolate.password[0] = 'abcdefghijkl';
                        $isolate.password[1] = 'abcdefghijkl ';
                        $isolate.password[2] = 'abcdefghijkl ';
                        $isolate.$digest();
                        expect($isolate.theForm.$valid).toEqual(false);
                        expect($isolate.theForm.password1.$error.pattern).toEqual(true);
                    });
                    
                    it('is false if password has spaces in it',function(){
                        $isolate.password[0] = 'abcdefghijkl';
                        $isolate.password[1] = 'abcde fghijkl';
                        $isolate.password[2] = 'abcde fghijkl';
                        $isolate.$digest();
                        expect($isolate.theForm.$valid).toEqual(false);
                    });
                    
                    describe('ng-disabled set correctly',function(){
                        beforeEach(function(){
                            findSubmit();
                        });
                        it('ng-disabled turned off if everything is good',function(){
                            expect($submit.prop('disabled')).toEqual(true);
                            $isolate.password[0] = 'abcdefghijkl';
                            $isolate.password[1] = 'abcdefghijkl';
                            $isolate.password[2] = 'abcdefghijkl';
                            $isolate.$digest();
                            expect($submit.prop('disabled')).toEqual(false);
                        });
                        
                        it('ng-disabled kept on if $valid = true, but passwords do not match',function(){
                            expect($submit.prop('disabled')).toEqual(true);
                            $isolate.password[0] = 'abcdefghijkl';
                            $isolate.password[1] = 'abcde fghijkl1';
                            $isolate.password[2] = 'abcde fghijkl2';
                            $isolate.$digest();
                            expect($submit.prop('disabled')).toEqual(true);
                        });
                    });

                    
                }); 
                
                describe('$scope.submit()',function(){
                    it('successful submit sets lastStatus',function(){
                        $isolate.email = 'howard@cinema6.com';
                        $isolate.password[0] = 'password';
                        $isolate.password[1] = 'new-password';
                        ctrl.changePassword.andReturn($q.when('hurray'));
                        expect($isolate.lastStatus).toBeNull();
                        $isolate.submit();
                        $isolate.$digest();
                        expect(ctrl.changePassword)
                            .toHaveBeenCalledWith('howard@cinema6.com','password','new-password');
                        expect($isolate.lastStatus).toEqual('Password has been changed.');
                    });

                    it('failed submit sets lastStatus',function(){
                        $isolate.email = 'howard@cinema6.com';
                        $isolate.password[0] = 'password';
                        $isolate.password[1] = 'new-password';
                        ctrl.changePassword.andReturn($q.reject('booo'));
                        expect($isolate.lastStatus).toBeNull();
                        $isolate.submit();
                        $isolate.$digest();
                        expect(ctrl.changePassword)
                            .toHaveBeenCalledWith('howard@cinema6.com','password','new-password');
                        expect($isolate.lastStatus).toEqual('Password change failed: booo');
                    });

                });


            });
        });

    });

}());
