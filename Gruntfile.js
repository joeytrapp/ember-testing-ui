module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      options: {
      },
      dev: ['*.js']
    },

    watch: {
      dev: {
        files: ['*.js'],
        tasks: ['lint']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('lint', ['jshint:dev']);
  grunt.registerTask('dev', ['lint', 'watch:dev']);
};
        
