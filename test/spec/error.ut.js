(function(){
    'use strict';

    define(['error'], function() {

        describe('lastError', function() {
            var lastError;

            beforeEach(function(){
                module('c6.glickm');

                inject(['$injector',function($injector){
                    lastError    = $injector.get('lastError');
                }]);
            });

            describe('lastError.Error',function(){
                var e;
                beforeEach(function(){
                    e = new lastError.Error(500,'Bad',true);
                });
                it('creates an Error object',function(){
                    expect(e).toBeDefined();
                });

                it('has readOnly properties',function(){
                    expect(function(){
                        e.code = 100;   
                    }).toThrow('setting a property that has only a getter');
                    expect(function(){
                        e.message = 'silly';
                    }).toThrow('setting a property that has only a getter');
                    expect(function(){
                        e.internal = false;
                    }).toThrow('setting a property that has only a getter');
                });

                it('has a toString',function(){
                    expect(e.toString()).toEqual('Internal Error (500): Bad');
                    expect(lastError.set('ugly',404,false).toString())
                        .toEqual('Error (404): ugly');
                });
            });

            describe('lastError.clear',function(){
                it('clears the errors array',function(){
                    lastError.errors.push('abc');
                    lastError.errors.push('def');
                    lastError.errors.push('ghi');
                    expect(lastError.errors.length).toEqual(3);
                    expect(lastError.clear()).toBe(lastError);
                    expect(lastError.errors.length).toEqual(0);
                    expect(lastError.errors[0]).not.toBeDefined();
                });
            });

            describe('lastError.getCount',function(){
                it('gets the count',function(){
                    expect(lastError.getCount()).toEqual(0);
                    lastError.set('abc');
                    expect(lastError.getCount()).toEqual(1);
                    lastError.push('def');
                    lastError.push('ghi');
                    expect(lastError.getCount()).toEqual(3);
                });
            });

            describe('lastError.push',function(){
                it('sets errors[0] with error',function(){
                    var e = lastError.push('i failed!',404,true);
                    expect(lastError.errors[0].message).toEqual('i failed!');
                    expect(lastError.errors[0].code).toEqual(404);
                    expect(lastError.errors[0].internal).toEqual(true);
                    expect(e).toBe(lastError.errors[0]);
                });

                it('defaults code to 500',function(){
                    lastError.push('i failed!'); 
                    expect(lastError.errors[0].code).toEqual(500);
                });

                it('defaults internal to false',function(){
                    lastError.push('i failed!'); 
                    expect(lastError.errors[0].internal).toEqual(true);
                });

                it('unshifts errors setting errors[0] with error',function(){
                    lastError.errors.push('abc');
                    lastError.errors.push('def');
                    lastError.errors.push('ghi');
                    expect(lastError.errors.length).toEqual(3);
                    lastError.push('i failed!'); 
                    expect(lastError.errors.length).toEqual(4);
                    expect(lastError.errors[0].message).toEqual('i failed!');
                });
            });
            
            describe('lastError.set',function(){
                it('erases errors list and replaces errors[0] with error',function(){
                    spyOn(lastError,'push').andCallThrough();
                    spyOn(lastError,'clear').andCallThrough();
                    lastError.errors.push('abc');
                    lastError.errors.push('def');
                    lastError.errors.push('ghi');
                    expect(lastError.errors.length).toEqual(3);
                    var e = lastError.set('i failed!'); 
                    expect(lastError.clear).toHaveBeenCalled();
                    expect(lastError.push).toHaveBeenCalled();
                    expect(lastError.errors.length).toEqual(1);
                    expect(lastError.errors[0].message).toEqual('i failed!');
                    expect(e).toBe(lastError.errors[0]);
                });
            });

            describe('lastError.get',function(){
                it('returns null if there are no errors',function(){
                    expect(lastError.get()).toBeNull();
                });

                it ('returns errors[0] if there are some errors',function(){
                    var e1 = lastError.set('err1'),
                        e2 = lastError.set('err2');;
                    expect(lastError.get()).toBe(e2);
                });
            });

            describe('lastError.getAll',function(){
                it('gets all',function(){
                    lastError.push('abc');
                    lastError.push('def');
                    lastError.push('ghi');
                    var errs = lastError.getAll();
                    expect(errs.length).toEqual(3);
                    expect(errs[0].message).toEqual('ghi');
                    expect(errs[1].message).toEqual('def');
                    expect(errs[2].message).toEqual('abc');
                });
            });
            
            describe('lastError.valueOf',function(){
                beforeEach(function(){
                    lastError.push('abc');
                    lastError.push('def');
                    lastError.push('ghi');
                });

                it('returns errors[0] if exists', function(){
                    expect(lastError.valueOf()).toEqual(lastError.errors[0]); 
                });
                
                it('returns empty if no error[0]', function(){
                    lastError.clear();
                    expect(lastError.valueOf()).toBeNull();
                });
            });

            describe('lastError.toString',function(){
                beforeEach(function(){
                    lastError.push('abc');
                    lastError.push('def');
                    lastError.push('ghi');
                });

                it('returns errors[0].toString if exists', function(){
                    expect(lastError.toString()).toEqual('Internal Error (500): ghi'); 
                });
                
                it('returns empty if no error[0]', function(){
                    lastError.clear();
                    expect(lastError.toString()).toEqual('empty'); 
                });
            });

        });
    });
}());
