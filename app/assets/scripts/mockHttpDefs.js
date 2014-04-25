(function(httpMock){
    'use strict';

    httpMock.whenGET('/api/auth/status').proxy('assets/mock/auth/login.json');
    httpMock.whenPOST('/api/auth/login', function(rqs){
        if (rqs.data.username === 'fail'){
            this.respond(404,'failed');
        } else {
            this.proxy('assets/mock/auth/login.json');
        }
    });
    httpMock.whenPOST('/api/auth/logout').respond(200,'ok');

}(window.__c6HttpMock));
