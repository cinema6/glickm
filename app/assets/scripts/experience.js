(function(){
    /* jshint -W106 */
    'use strict';

    angular.module('c6.glickm')
    .controller('ExperienceCtrl',['$log','$scope','$q',
            'c6BrowserInfo','postMessage','experience',
        function($log,$scope,$q,c6BrowserInfo,postMessage,experience){
        $log = $log.context('ExperienceCtrl');
        $log.info('instantiated with:', experience);
        var self = this;
        $scope.experience = experience;

        $scope.$on('iframeReady',function(event,$iframe){
            self.registerExperience(experience,$iframe[0].contentWindow);
        });

        $scope.$on('$destroy',function(){
            $log.info('got destroy, tear down experience and session');
            self.deregisterExperience();
        });

        this.registerExperience = function(experience, expWindow) {
            var session = postMessage.createSession(expWindow);

            $log.info('SESSION:',session);
            session.experience = experience;
            session.ready = false;

            session.once('handshake', function(data, respond) {
                $log.info('HAND SHAKE!');
                respond({
                    success: true,
                    appData: {
                        experience: experience,
                        profile : c6BrowserInfo.profile
                    }
                });
            });

            session.once('ready', function() {
                session.ready = true;
                self.session = session;
                $log.info('SESSION:',self.session);
            });
        };
        
        this.deregisterExperience = function() {
            var session = self.session;
            postMessage.destroySession(session.id);
            delete self.session;
        };

    }])
    .directive('c6Experience',['$log','c6UrlMaker',function($log,c6UrlMaker){
        $log = $log.context('c6Experience');
        function fnLink(scope,element){
            var url = c6UrlMaker(
                scope.experience.appUri + '/' +
                scope.experience.appUriPrefix, 'exp');

            $log.info('experience url:',url);
            var $iframe = angular.element(
                '<iframe src="' + url + '"width="100%" height="100%" class="ui__viewFrame"></iframe>'
            );
            $iframe.on('load',function(){
                $log.info('experiences is loaded!');
                scope.$emit('iframeReady',$iframe);
            });
            element.append($iframe);
        }
        return {
            link : fnLink,
            restrict : 'E',
            scope : {
                experience : '='
            }
        };

    }]);
}());


