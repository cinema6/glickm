(function(){
    'use strict';

    define(['experience', 'templates'], function() {
        describe('ExperienceCtrl', function() {
            var $rootScope,
                $scope,
                $log,
                c6BrowserInfo,
                c6EventEmitter,
                postMessage,
                session,
                experience,
                tracker,
                ExpCtrl,
                createController;

            beforeEach(function() {

                tracker = {
                    pageview :  jasmine.createSpy('tracker.pageview')
                };
               
                postMessage = {
                    createSession : jasmine.createSpy('postMessage.createSession'),
                    destroySession : jasmine.createSpy('postMessage.destroySession')
                };

                c6BrowserInfo = {
                    profile : null
                };
                
                experience = {
                    id  : 'e1',
                    uri : 'e1uri'
                };

                module('c6.glickm');

                inject(function($injector, $controller ) {
                    $log        = $injector.get('$log');
                    $rootScope  = $injector.get('$rootScope');
                    $scope      = $rootScope.$new();
                    c6EventEmitter = $injector.get('c6EventEmitter');
                    
                    $log.context = function(){ return $log; }

                    createController = function(){
                        ExpCtrl = $controller('ExperienceCtrl', {
                            $scope          : $scope,
                            $log            : $log,
                            postMessage     : postMessage,
                            c6BrowserInfo   : c6BrowserInfo,
                            experience      : experience,
                            tracker         : tracker
                        });
                    };
                });
            });

            describe('initialization',function(){
                it('exists',function(){
                    createController();
                    expect(ExpCtrl).toBeDefined();
                });

                it('puts the experience on the scope, session is null',function(){
                    createController();
                    expect($scope.experience).toBe(experience);
                    expect(ExpCtrl.session).toBeNull();
                });

                it('will send a pageview with exp.uri as title when it loads',function(){
                    createController();
                    expect(tracker.pageview).toHaveBeenCalledWith('/e1uri','e1uri');
                });
            
                it('will send a pageview with exp.title as title when it loads',function(){
                    experience.title = 'test';
                    createController();
                    expect(tracker.pageview).toHaveBeenCalledWith('/e1uri','test');
                });
            });

            describe('$scope.$on(iframeReady)',function(){
                var iframeReady,
                    session;

                beforeEach(function(){
                    session = c6EventEmitter({});

                    spyOn($scope,'$on').andCallFake(function(e,h){
                        if (e === 'iframeReady'){
                            iframeReady = h;
                        }
                    });
                     
                    createController();

                    spyOn(ExpCtrl,'registerExperience')
                        .andReturn(session);
                });

                it('should be listening',function(){
                    expect(iframeReady).toBeDefined();
                });

                it('should pass its param to registerExperience',function(){
                    var win = {};
                    iframeReady({},win);
                    expect(ExpCtrl.registerExperience).toHaveBeenCalledWith(experience,win);
                });

                it('should $broadcast the resizeExperience event when the session\'s app\'s DOM is modified', function() {
                    spyOn($scope, '$broadcast');
                    iframeReady({}, {});
                    session.emit('domModified');

                    expect($scope.$broadcast).toHaveBeenCalledWith('resizeExperience');
                });
            });
            
            describe('$scope.$on($destroy)',function(){
                var $destroy;
                beforeEach(function(){
                    spyOn($scope,'$on').andCallFake(function(e,h){
                        if (e === '$destroy'){
                            $destroy = h;
                        }
                    });
                     
                    createController();

                    spyOn(ExpCtrl,'deregisterExperience');
                });

                it('should be listening',function(){
                    expect($destroy).toBeDefined();
                });

                it('should pass its session to deregisterExperience',function(){
                    ExpCtrl.session = {};
                    $destroy({});
                    expect(ExpCtrl.deregisterExperience).toHaveBeenCalledWith();
                });
                
                it('should do nothing if it has no session',function(){
                    ExpCtrl.session = null;
                    $destroy({});
                    expect(ExpCtrl.deregisterExperience).not.toHaveBeenCalledWith();
                });
            });

            describe('registerExperience',function(){
                var contentWindow, onceReady, onceHandshake;
                beforeEach(function(){
                    session = c6EventEmitter({});
                    spyOn(session, 'once').andCallFake(function(e,h){
                        if (e === 'ready'){
                            onceReady = h;
                        }
                        if (e === 'handshake'){
                            onceHandshake = h;
                        }
                    });

                    contentWindow = {};
                    postMessage.createSession.andReturn(session);
                    createController();
                    ExpCtrl.registerExperience(experience,contentWindow);

                });

                it('will call postMessage.createSession',function(){
                    expect(postMessage.createSession)
                        .toHaveBeenCalledWith(contentWindow);
                });

                it('will set the ExpCtrl session with result',function(){
                    expect(ExpCtrl.session).toBe(session);
                    expect(ExpCtrl.session.ready).toEqual(false);
                });

                it('will setup callbacks for session events',function(){
                    expect(onceReady).toBeDefined('session.once(ready)');
                    expect(onceHandshake).toBeDefined('session.once(handshake)');
                });

                it('will set session.ready to true when ready',function(){
                    onceReady();
                    expect(ExpCtrl.session.ready).toEqual(true);
                });

                it('respond to handshakes',function(){
                    var responder = jasmine.createSpy('respond'),
                        user = { id : 'u1' };
                    $scope.user = user;
                    onceHandshake(null,responder);
                    expect(responder).toHaveBeenCalledWith({
                        success: true,
                        appData: {
                            experience  : experience,
                            user        : user,
                            profile     : c6BrowserInfo.profile
                        }
                    });
                });

            });

            describe('deregisterExperience',function(){
                beforeEach(function(){
                    createController();
                    ExpCtrl.session = {
                        id : 'session1'
                    };
                    ExpCtrl.deregisterExperience();
                });

                it('calls postMessage destroySession',function(){
                    expect(postMessage.destroySession).toHaveBeenCalledWith('session1');
                });

                it('deletes the session from the controller',function(){
                    expect(ExpCtrl.session).not.toBeDefined();
                });

            });
        });
    });
}());
