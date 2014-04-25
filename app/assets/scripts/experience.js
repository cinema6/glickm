(function(){
    /* jshint -W106 */
    'use strict';

    angular.module('c6.glickm')
    .controller('ExperienceCtrl',['$log','$scope','experience',
        function($log,$scope,experience){
        $log = $log.context('ExperienceCtrl');
        $log.info('instantiated with:', experience);
        $scope.experience = experience;
    }])
    .directive('c6Experience',['$log','c6UrlMaker',function($log,c6UrlMaker){
        $log = $log.context('c6Experience');
        function fnLink(scope,element){
            $log.info('EXP:',scope.experience());
            var url = c6UrlMaker(scope.experience().appUri,'exp');
            $log.info('url:',url);
            var $clone = angular.element('<div> get happy </div>');
            element.append($clone);
        }
        return {
            link : fnLink,
            restrict : 'E',
            scope : {
                experience : '&'
            }
        };

    }]);
}());


