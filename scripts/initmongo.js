var mongodb = require('mongodb'), q = require('q');

function resetCollection(collection,data,dbConfig){
    var cli, db, coll;
    var mongoClient = new mongodb.MongoClient(
            new mongodb.Server(dbConfig.host, dbConfig.port), {native_parser:true}
    );
    return q.npost(mongoClient, 'open')
        .then(function(mongoClient){
            cli     = mongoClient;
            db      = cli.db(dbConfig.db);
            coll    = db.collection(collection);
            if  (dbConfig.user){
                return q.npost(db, 'authenticate', [ dbConfig.user, dbConfig.pass]);
            }
            return q();
        })
        .then(function(){
            return q.npost(db, 'collectionNames', [collection]);
        })
        .then(function(names){
            if (names.length === 0 ) {
                return q();
            }
            return q.npost(coll, 'drop');
        })
        .then(function(){
            if (!data) {
                return q();
            }

            if (data instanceof Array) {
                return q.all(data.map(function(obj) {
                    return q.npost(coll,'insert',[obj, { w: 1, journal: true }]);
                }));
            }
            
            return q.npost(coll,'insert',[data, { w: 1, journal: true }]);
        })
        .then(function(){
            cli.close();
        });
}

var mockUser = {
    id : "u-1234567890abcd",
    created : new Date(),
    username : "joe",
    password : "$2a$10$XomlyDak6mGSgrC/g1L7FO.4kMRkj4UturtKSzy6mFeL8QWOBmIWq" // hash of 'password'
};

console.log('reset collection');
resetCollection('users',mockUser,{
    host : '33.33.33.20',
    port :  27017,
    db   : 'c6Db',
    user : 'auth',
    pass : 'password'
})
.then(function(){
    console.log('update complete');
})
.catch(function(err){
    console.log('update failed:',err);
    process.exit(1);
});
