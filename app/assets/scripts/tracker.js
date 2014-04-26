(function(){
    'use strict';

    angular.module('c6.glickm')
    .service('tracker',['$window',function($window){

        this.create = function(){
            var args = Array.prototype.slice.call(arguments,0);
            args.unshift('create');
            $window.ga.apply(null,args);
        };

        this.send = function(){
            var args = Array.prototype.slice.call(arguments,0);
            args.unshift('send');
            $window.ga.apply(null,args);
        };
        
        this.pageview = function(){
            var args = Array.prototype.slice.call(arguments,0);
            if (args.length > 1){
                args = [{
                    page  : args[0],
                    title : args[1]
                }];
            }
            args.unshift('pageview');
            args.unshift('send');
            $window.ga.apply(null,args);
        };

    }]);

}());
