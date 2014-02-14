(function() {
    'use strict';
    
    var grunt        = require('grunt'),
        proxySnippet = require('grunt-connect-proxy/lib/utils').proxyRequest;

    module.exports = {
        options: {
            port: '<%= settings.connectPort %>',
            hostname: '0.0.0.0',
            livereload: true
        },
        proxies: [ 
            {
                context: '/api',
                host: '33.33.33.20',
                port: 443,
                https: true,
                changeOrigin: true
            } 
        ],
        dev: {
            options: {
                middleware: function(connect,options) {
                    return [
                        proxySnippet,
                        connect.static(grunt.config.get('settings.appDir')),
                        connect.static('.tmp')
                    ];
                }
            }
        }
    };
})();
