
(function() {
    'use strict';

    module.exports = {
        options: {
            host : '33.33.33.20',
            port :  27017,
            db   : 'c6Db',
            user : 'auth',
            pass : 'password'
        },
        users: {
            data    : [ 
                {
                    id : "u-1234567890abcd",
                    created : new Date(),
                    username : "howard",
                    password : "$2a$10$XomlyDak6mGSgrC/g1L7FO.4kMRkj4UturtKSzy6mFeL8QWOBmIWq"
                },
                {
                    id : "u-0987654321ghij",
                    created : new Date(),
                    username : "evan",
                    password : "$2a$10$XomlyDak6mGSgrC/g1L7FO.4kMRkj4UturtKSzy6mFeL8QWOBmIWq"
                },
                {
                    id : "u-9394939394disx",
                    created : new Date(),
                    username : "josh",
                    password : "$2a$10$XomlyDak6mGSgrC/g1L7FO.4kMRkj4UturtKSzy6mFeL8QWOBmIWq"
                }
            ]
        }
    };

}());
