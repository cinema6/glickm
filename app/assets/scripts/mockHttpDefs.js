(function(httpMocks){
    'use strict';

    /*
     * Content Endpoints
     */
    httpMocks.whenGET('/api/content/experience/e-51ae37625cb57f')
        .proxy('assets/mocks/experiences/e-51ae37625cb57f.json');

    /*
     * Auth Endpoints
     */
    httpMocks.whenGET('/api/auth/status')
        .proxy('assets/mocks/auth/login.json');

    httpMocks.whenPOST('/api/auth/login', function(rqs){
        if (rqs.data.username === 'fail'){
            this.respond(404,'failed');
        } else {
            this.proxy('assets/mocks/auth/login.json');
        }
    });
    httpMocks.whenPOST('/api/auth/logout').respond(200,'ok');

}(window.c6HttpMocks));
