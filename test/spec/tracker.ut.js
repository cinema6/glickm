(function(){
    'use strict';
    define(['tracker'], function() {

        describe('tracker', function() {
            var $window, tracker;
            
            beforeEach(function(){
                module('c6.glickm');

                inject(['$injector',function($injector){
                    tracker     = $injector.get('tracker');
                    $window     = $injector.get('$window');

                    $window.ga  = jasmine.createSpy('$window.ga');
                }]);
                
            });

            describe('tracker.create',function(){

                it('will call $window.ga("create")',function(){
                    tracker.create('abc','auto');
                    expect($window.ga).toHaveBeenCalledWith('create','abc','auto');
                });

            });

            describe('tracker.send',function(){

                it('will call $window.ga("send")',function(){
                    tracker.send('pageview');
                    expect($window.ga).toHaveBeenCalledWith('send','pageview');
                });

            });

            describe('tracker.pageview',function(){

                it('() will call $window.ga("send","pageview")',function(){
                    tracker.pageview();
                    expect($window.ga).toHaveBeenCalledWith('send','pageview');
                });

                it('(page) will call $window.ga("send","pageview",page)',function(){
                    tracker.pageview('page');
                    expect($window.ga).toHaveBeenCalledWith('send','pageview','page');
                });

                it('(page,title) will call $window.ga("send","pageview",page,title)',function(){
                    tracker.pageview('page','title');
                    expect($window.ga).toHaveBeenCalledWith('send','pageview',{
                        'page'  : 'page',
                        'title' : 'title'
                    });
                });

            });

        });
    });
}());
