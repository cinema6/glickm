(function(){
    'use strict';

    define(['error', 'templates'], function() {
        describe('ErrorCtrl', function() {
            var $rootScope,
                $scope,
                $log,
                tracker,
                lastError,
                ErrorCtrl,
                createController;

            beforeEach(function() {

                tracker = {
                    pageview :  jasmine.createSpy('tracker.pageview'),
                    error    :  jasmine.createSpy('tracker.error')
                };
               
                module('c6.glickm');

                inject(function($injector, $controller ) {
                    $log        = $injector.get('$log');
                    $rootScope  = $injector.get('$rootScope');
                    $scope      = $rootScope.$new();
                    
                    $log.context = function(){ return $log; }

                    lastError = {
                        get     : jasmine.createSpy('lastError.get').andReturn(null),
                        clear   : jasmine.createSpy('lastError.clear')
                    };

                    createController = function(){
                        ErrorCtrl = $controller('ErrorCtrl', {
                            $scope          : $scope,
                            $log            : $log,
                            tracker         : tracker,
                            lastError       : lastError
                        });
                    };
                });
            });
            
            describe('with lastError === null',function(){
                beforeEach(function(){
                    createController();
                });
                it('exists',function(){
                    expect(ErrorCtrl).toBeDefined();
                });

                it('sets a default statusCode and errorMessage to the scope',function(){
                    expect($scope.statusCode).toEqual(404);
                    expect($scope.errorMessage).toEqual('Something went horribly wrong!');
                });
                
                it('will send a pageview with error when it loads',function(){
                    createController();
                    expect(tracker.pageview).toHaveBeenCalledWith({
                        'page':'/error/404/Something%20went%20horribly%20wrong!','title':'Glickm Error'});
                });
            });

            describe('with lastError set with internal error',function(){
                var err;
                beforeEach(function(){
                    err = {
                        code : 500,
                        message : 'fubar',
                        internal : true
                    };
                    lastError.get.andReturn(err);
                    createController();
                });

                it('should get the lastError',function(){
                    expect(lastError.get).toHaveBeenCalled();
                });

                it('will send not send a pageview with error when it loads',function(){
                    createController();
                    expect(tracker.pageview).not.toHaveBeenCalled();
                });
                
                it('will not put the errors data on the scope',function(){
                    expect($scope.statusCode).toEqual(404);
                    expect($scope.errorMessage).toEqual('Something went horribly wrong!');
                });


                it('should call tracker.error',function(){
                    expect(tracker.error).toHaveBeenCalledWith(err,{page:'/error/404/Something%20went%20horribly%20wrong!',title:'Glickm Error'});
                });

            });
            
            describe('with lastError set with external error',function(){
                var err;
                beforeEach(function(){
                    err = {
                        code : 500,
                        message : 'fubar',
                        internal : false
                    };
                    lastError.get.andReturn(err);
                    createController();

                });
                
                it('will send not send a pageview with error when it loads',function(){
                    createController();
                    expect(tracker.pageview).not.toHaveBeenCalled();
                });

                it('will put the errors data on the scope',function(){
                    expect($scope.errorMessage).toEqual('fubar');
                    expect($scope.statusCode).toEqual(500);
                });

                it('should call tracker.error',function(){
                    expect(tracker.error).toHaveBeenCalledWith(err,{page:'/error/500/fubar',title:'Glickm Error'});
                });


            });
        });
    });
}());
