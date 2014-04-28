(function(isKarma){
    /* jshint -W106 */
    'use strict';

    angular.module('c6.glickm')
    .controller('ErrorCtrl',['$log','$scope','tracker','lastError',
        function($log,$scope,tracker,lastError){
        var pageObject, err = lastError.get();
        $log = $log.context('ErrorCtrl');
        $log.info('instantiated with lastError ',err);

        $scope.statusCode   = 404;
        $scope.errorMessage = 'Something went horribly wrong!';

        if ((err !== null) && (err.internal === false)){
            $scope.statusCode = err.code;
            $scope.errorMessage = err.message;
        }

        pageObject = {
            page : encodeURI('/error/' + $scope.statusCode + '/' + $scope.errorMessage),
            title : 'Glickm Error'
        };
        
        if ( err !== null) {
            tracker.error(err,pageObject);
            lastError.clear();
            return;
        }
        
        tracker.pageview(pageObject);
    }])
    .service('lastError',[function(){
        var errors = [];

        function ErrorObject(code,message,internal){
            Object.defineProperties(this,{
                'code' : {
                    get         : function() { return code; },
                    enumerable : true
                },
                'message' : {
                    get         : function() { return message; },
                    enumerable : true
                },
                'internal' : {
                    get         : function() { return internal; },
                    enumerable : true
                }
            });
        }

        ErrorObject.prototype.toString = function(){
            return  (this.internal ? 'Internal Error (' : 'Error (') +
                this.code + '): ' + this.message;
        };

        this.valueOf = function(){
            return this.get();
        };

        this.toString = function(){
            return (errors.length) ? this.get().toString() : 'empty';
        };

        this.clear = function(){
            errors.length = 0;
            return this;
        };

        this.push = function(message,code,internal){
            errors.unshift( new ErrorObject(code || 500, message,
                ((internal === undefined) ? true : !!internal) ));
            return errors[0];
        };

        this.set = function(){
            return this.clear().push.apply(this,arguments);
        };
        
        this.get = function(){
            return (errors[0] || null);
        };

        this.getCount = function(){
            return errors.length;
        };

        this.getAll = function(){
            return angular.copy(errors);
        };

        if (isKarma){
            this.errors = errors;
            this.Error  = ErrorObject;
        }
    }]);

}(!!window.__karma__));


