(function(){
    /* jshint -W106 */
    'use strict';

    angular.module('c6.glickm')
    .controller('ExperienceCtrl',['$log','$scope',
            'c6BrowserInfo','postMessage','experience', 'tracker',
        function($log,$scope,c6BrowserInfo,postMessage,experience,tracker){
        $log = $log.context('ExperienceCtrl');
        $log.info('instantiated with:', experience);
        var self = this;

        this.session = null;

        $scope.experience = experience;

        $scope.$on('iframeReady',function(event,contentWindow){
            self.registerExperience(experience,contentWindow);
        });

        $scope.$on('$destroy',function(){
            $log.info('$scope is being destroyed');
            if (self.session){
                self.deregisterExperience();
            }
        });

        this.registerExperience = function(experience, expWindow) {
            $log.info('registerExperience: %1 (%2)',experience.id,experience.uri);
            var session = postMessage.createSession(expWindow);

            $log.info('session:',session);
            session.ready = false;

            session.once('handshake', function(data, respond) {
                $log.info('hands have been shaken:',data);
                respond({
                    success: true,
                    appData: {
                        experience  : experience,
                        profile     : c6BrowserInfo.profile
                    }
                });
            });

            session.once('ready', function() {
                $log.info('session is ready:',session);
                session.ready = true;
            });

            self.session = session;

            return self.session;
        };
        
        this.deregisterExperience = function() {
            $log.info('deregisterExperience: %1 (%2)',experience.id,experience.uri);
            var session = self.session;
            postMessage.destroySession(session.id);
            delete self.session;
        };

        tracker.pageview('/' + experience.uri, (experience.title || experience.uri));
    }])
    .directive('c6Experience',['$log','$timeout','c6UrlMaker',
        function($log,$timeout,c6UrlMaker){
        $log = $log.context('c6Experience');
        function fnLink(scope,element){
            var url = c6UrlMaker(
                scope.experience.appUri + '/' +
                scope.experience.appUriPrefix, 'exp');

            $log.info('experience url:',url);
            var $iframe = angular.element(
                '<iframe src="' + url +
                '"width="100%" height="100%" class="ui__viewFrame"></iframe>'
            );
            $iframe.on('load',function(){
                $log.info('experience is loaded!');
                $timeout(function(){
                    scope.$emit('iframeReady',$iframe[0].contentWindow);
                });
            });
            element.append($iframe);
        }
        return {
            link     : fnLink,
            restrict : 'E'
        };

    }]);
}());


