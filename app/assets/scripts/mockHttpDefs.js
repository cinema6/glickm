(function(httpMocks){
    'use strict';

    /*
     * Content Endpoints
     */
    httpMocks.whenGET('/api/content/experience/e-51ae37625cb57f')
        .proxy('assets/mocks/experiences/e-51ae37625cb57f.json');

    /*
     * Org Endpoints
     */
    httpMocks.whenGET('/api/accounts/org/e2e-org')
        .proxy('assets/mocks/accounts/org/e2e-org.json');

    /*
     * Auth Endpoints
     */
    httpMocks.whenGET('/api/auth/status')
        .proxy('assets/mocks/auth/login.json');

    httpMocks.whenPOST('/api/auth/login', function(rqs){
        if (rqs.data.email === 'fail@cinema6.com'){
            this.respond(404,'failed');
        } else {
            this.proxy('assets/mocks/auth/login.json');
        }
    });
    httpMocks.whenPOST('/api/auth/logout').respond(200,'ok');
    
    httpMocks.whenPOST('/api/account/user/email', function(rqs){
        if (rqs.data.newEmail !== 'howard@cinema6.com'){
            this.respond(404,rqs.data.newEmail + ' is not howard!');
        } else {
            this.respond(200,'Congratulations, you are now howard!');
        }
    });

    httpMocks.whenPOST('/api/account/user/password', function(rqs){
        if (rqs.data.newPassword === 'failfail'){
            this.respond(404,'Failed to change password.');
        } else {
            this.respond(200,'Congratulations, you have a new password!');
        }
    });

}(window.c6HttpMocks));
