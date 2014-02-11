(function() {
    'use strict';
    
    var grunt = require('grunt');

    module.exports = {
        options: {
            hostname: '0.0.0.0'
        },
        dev: {
            options: {
                port: '<%= settings.connectPort %>',
                middleware: function(connect,options) {
                    return [
                        require('connect-livereload')(),
                        connect.static(grunt.config.get('settings.appDir')),
                        connect.static('.tmp')
                    ];
                }
            }
        }
    };
})();
