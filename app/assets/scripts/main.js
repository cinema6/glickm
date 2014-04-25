(function(){
    /*jshint -W080 */
    'use strict';

    var __C6_BUILD_VERSION__ = window.__C6_BUILD_VERSION__ = undefined,
        __C6_APP_BASE_URL__ = window.__C6_APP_BASE_URL__ = __C6_BUILD_VERSION__ || 'assets',
        c6 = window.c6 = (window.c6 || {});

    require.config({
        baseUrl:  __C6_APP_BASE_URL__
    });

    var libUrl = function(url) {
            return 'http://lib.cinema6.com/' + url;
        },
        appScripts = (function() {
            if (__C6_BUILD_VERSION__) {
                return [
                    'scripts/c6app.min'
                ];
            } else {
                return [
                    'scripts/mockHttp',
                    'scripts/mockHttpDefs',
                    'scripts/app',
                    'scripts/auth',
                    'scripts/login'
                ];
            }
        }()),
        libScripts = (function() {
            if (__C6_BUILD_VERSION__) {
                return [
                    libUrl('modernizr/modernizr.custom.71747.js'),
                    libUrl('jquery/2.0.3-0-gf576d00/jquery.min.js'),
                    libUrl('gsap/1.11.2-0-g79f8c87/TweenMax.min.js'),
                    libUrl('gsap/1.11.2-0-g79f8c87/TimelineMax.min.js'),
                    libUrl('angular/v1.2.12-0-g5cc5cc1/angular.min.js'),
                    libUrl('angular/v1.2.12-0-g5cc5cc1/angular-route.min.js'),
                    libUrl('angular/v1.2.12-0-g5cc5cc1/angular-animate.min.js'),
                    libUrl('c6ui/v2.4.0-0-gb74a3dd/c6uilib.min.js'),
                    libUrl('c6ui/v2.4.0-0-gb74a3dd/c6log.min.js')
                ];
            } else {
                return [
                    libUrl('modernizr/modernizr.custom.71747.js'),
                    libUrl('jquery/2.0.3-0-gf576d00/jquery.js'),
                    libUrl('gsap/1.11.2-0-g79f8c87/TweenMax.min.js'),
                    libUrl('gsap/1.11.2-0-g79f8c87/TimelineMax.min.js'),
                    libUrl('angular/v1.2.12-0-g5cc5cc1/angular.js'),
                    libUrl('angular/v1.2.12-0-g5cc5cc1/angular-route.js'),
                    libUrl('angular/v1.2.12-0-g5cc5cc1/angular-animate.js'),
                    libUrl('c6ui/v2.4.0-0-gb74a3dd/c6uilib.js'),
                    libUrl('c6ui/v2.4.0-0-gb74a3dd/c6log.js')
                ];
            }
        }());

    function loadScriptsInOrder(scriptsList, done) {
        var script;

        if (scriptsList) {
            script = scriptsList.shift();

            if (script) {
                require([script], function() {
                    loadScriptsInOrder(scriptsList, done);
                });
                return;
            }
        }
        done();
    }

    c6.kBaseUrl = __C6_APP_BASE_URL__;
    c6.kApiUrl = window.location.origin; //window.location.protocol + '://' + window.location.host;

    if ((window.location.host === 'portal.cinema6.com') ||
        (window.location.host === 'cinema6.com')) {
        c6.kDebug = false;
        ga('create', 'UA-44457821-2', 'cinema6.com');
    } else
    if (window.location.host === 'staging.cinema6.com')  {
        c6.kDebug = true;
        ga('create', 'UA-44457821-2', 'staging.cinema6.com');
    } else {
        c6.kDebug = true;
        ga('create', 'UA-44457821-1', { 'cookieDomain' : 'none' });
        c6.kApiUrl = '';
    }
   
    c6.kHasKarma = false;
    c6.kLogFormats = c6.kDebug;
    c6.kLogLevels = (c6.kDebug) ? ['error','warn','log','info'] : [];
    c6.kModDeps = ['ngAnimate','ngRoute','c6.ui', 'c6.log', 'c6.glickm.services'];

    loadScriptsInOrder(libScripts, function() {
        var Modernizr = window.Modernizr;

        Modernizr.load({
            test: Modernizr.touch,
            yep: [
                __C6_BUILD_VERSION__ ?
                    libUrl('angular/v1.2.12-0-g5cc5cc1/angular-touch.min.js') :
                    libUrl('angular/v1.2.12-0-g5cc5cc1/angular-touch.js')
            ],
            nope: [
                libUrl('c6ui/v2.4.0-0-gb74a3dd/css/c6uilib--hover.min.css'),
                __C6_APP_BASE_URL__ + '/styles/main--hover.css'
            ],
            complete: function() {
                if (Modernizr.touch) { c6.kModDeps.push('ngTouch'); }

                loadScriptsInOrder(appScripts, function() {
                    angular.bootstrap(document.documentElement, ['c6.glickm']);
                });
            }
        });
    });
}());
