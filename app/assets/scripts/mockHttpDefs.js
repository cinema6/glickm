(function(httpMocks){
    'use strict';

    httpMocks.whenGET('/api/auth/status').proxy('assets/mock/auth/login.json');
    httpMocks.whenPOST('/api/auth/login', function(rqs){
        if (rqs.data.username === 'fail'){
            this.respond(404,'failed');
        } else {
            this.proxy('assets/mock/auth/login.json');
        }
    });
    httpMocks.whenPOST('/api/auth/logout').respond(200,'ok');

}(window.c6HttpMocks));
