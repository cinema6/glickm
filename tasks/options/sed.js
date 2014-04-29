(function() {
    'use strict';
    module.exports = {
        index1: {
            pattern: 'assets',
            replacement: '<%= _version %>',
            path: [
                '.tmp/templates.js',
                '<%= settings.distDir %>/index.html'
            ]
        },
        index2: {
            pattern:        'kIsBuild:false',
            replacement:    'kIsBuild:true',
            path: [
                '.tmp/templates.js',
                '<%= settings.distDir %>/index.html'
            ]
        }
    };
}());
