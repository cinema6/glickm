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
            var session = self.registerExperience(experience,contentWindow);

            session.on('stateChange', function broadcastResize() {
                $scope.$broadcast('resizeExperience');
            });
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
                        user        : $scope.user,
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
    .directive('c6Experience',['$log','$timeout','c6UrlMaker','c6Defines','$window',
        function($log,$timeout,c6UrlMaker,c6Defines,$window){
        $log = $log.context('c6Experience');
        function fnLink(scope,element){
            var $iframe, params = [], url = c6UrlMaker(
                scope.experience.appUri + '/' +
                (c6Defines.kEnv === 'dev' ? scope.experience.appUriPrefix : ''),
                'exp'),
                $$window = angular.element($window);

            function resizeFrame() {
                var contentHeight = $iframe.contents().find('body').outerHeight();

                $iframe.height(contentHeight);
            }

            $log.info('experience url:',url);
            if (c6Defines.kEnv !== 'production'){
                params.push('kEnv=' + c6Defines.kEnv);
            }
            if (c6Defines.kDebug){
                params.push('kDebug=1');
            }
            params.push('kTracker=' + c6Defines.kTracker.accountId + (
                (c6Defines.kTracker.config.cookieDomain === 'none') ? ':none' : ''));
            
            $iframe = angular.element(
                '<iframe src="' + url + '?' + params.join('&') +
                '" width="100%" height="100%" class="ui__viewFrame"></iframe>'
            );
            $iframe.on('load',function(){
                $log.info('experience is loaded!');
                $timeout(function(){
                    scope.$emit('iframeReady',$iframe[0].contentWindow);
                });
            });
            element.append($iframe);

            $$window.on('resize', resizeFrame);
            scope.$on('resizeExperience', resizeFrame);

            element.on('$destroy', function() {
                $$window.off('resize', resizeFrame);
            });
        }
        return {
            link     : fnLink,
            restrict : 'E'
        };

    }]);
}());


