module.exports = function(grunt) {
    'use strict';

    grunt.registerTask('fixtures', 'Create a fixtures file based on plugin experience.json',
        function() {
        var files = grunt.file.expand('app/assets/experiences/**/experiences.json');
        files.forEach(function(file){
            var exps = grunt.file.readJSON(file);
            exps.forEach(function(experience){
                grunt.log.writelns('Write experience: ' + experience.id);
                experience.appUriPrefix = 'app/index.html';
                grunt.file.write('app/assets/mock/experiences/' +
                    experience.id + '.json',JSON.stringify(experience,null,3));
            });
        });
    });
};

