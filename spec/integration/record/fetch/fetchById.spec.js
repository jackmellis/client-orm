import test from 'ava-spec';
import ORM from '../../../../src';
import mockHttp from 'mock-http-client';
import Storage from '../../../../stores/default';

test.beforeEach(t => {
  let store = {};
  let storage = Storage(store);
  let http = mockHttp();
  let db = new ORM({storage, http});



  t.context = {store, storage, db, http};
});

test.group('fetchById', test => {
  function setup(t) {
    t.context.users = t.context.db.define({
      name : 'users',
      fields : {
        id : String,
        name : String,
        permission : Number
      },
      api : {
        get : '/api/get',
        getOne : '/api/getone',
        getById : '/api/getbyid/{id}'
      }
    });

    t.context.http.when(/\/api\/get.*/).return({
      data : [
        {
          id : '1',
          name : 'One',
          permission : 1
        },
        {
          id : '2',
          name : 'Two',
          permission : 1
        },
        {
          id : '3',
          name : 'Three',
          permission : 1
        },
        {
          id : '4',
          name : 'Four',
          permission : 4
        }
      ]
    });

    t.context.http.when(/\/api\/getone.*/).return({
      data : [
        {
          id : '1',
          name : 'One',
          permission : 1
        }
      ]
    });

    t.context.http.when(/\/api\/getbyid\/\d/).call(config => {
      let id = config.url.split('').pop();
      return {
        data : {
          id : id,
          name : id,
          permission : +id
        }
      };
    });

    return t.context;
  }
  test('should just return undefined if no api address', async t => {
    let users = t.context.db.define({
      name : 'users',
      fields : {
        id : String,
        name : String,
        permission : Number
      }
    });

    let result = await users.fetchById(1);

    t.is(result, undefined);
  });
  test('should do a regular fetchOne if no api address', async t => {
    let {http} = setup(t);
    let users = t.context.db.define({
      name : 'users',
      fields : {
        id : String,
        name : String,
        permission : Number
      },
      api : {
        get : '/api/get',
        getOne : '/api/getOne'
      }
    });

    http.expect('get', /\/api\/get.*/, 0).stop();
    http.expect('get', /\/api\/getbyid.*/, 0).stop();
    http.expect('get', '/api/getone?id=2', 1).return({data:{}});

    users.fetchById(2);

    await users.wait();

    http.assert();
    t.pass();
  });
  test('should still return just one from fetch request', async t => {
    let {http} = setup(t);
    let users = t.context.db.define({
      name : 'users',
      fields : {
        id : String,
        name : String,
        permission : Number
      },
      api : {
        get : '/api/get'
      }
    });

    let user = await users.fetchById('4');

    t.false(Array.isArray(user));
    t.not(user, undefined);
    t.is(user.id, '4');
    t.is(user.name, 'Four');
  });
  test('should fetch a single result from the api', async t => {
    let {users, http} = setup(t);
    let user = await users.fetchById('9');

    t.not(user, undefined);
    t.is(user.id, '9');
    t.is(user.name, '9');
    t.is(user.permission, 9);
  });
  test('should piggyback onto a previous fetchById request if the query is the same', async t => {
    let {users, http} = setup(t);
    http.expect(/.*/, /.*/, 0).stop();
    http.expect('get', '/api/getbyid/2', 1).return({data:[]});

    users.fetchById('2');
    users.fetchById('2');

    await users.wait();

    http.assert();
    t.pass();
  });
  test('should piggyback ont a previous fetch request if the query is the same', async t => {
    let {users, http} = setup(t);
    http.expect('get', '/api/get', 1).return({data:[]});
    http.expect('get', /\/api\/getbyid.*/, 0).stop();

    users.fetch();
    users.fetchById('2');
    users.fetchById('2');

    await users.wait();

    http.assert();
    t.pass();
  });
  test('should throw an error if the api request fails', async t => {
    let {users, http} = setup(t);
    let err = new Error();
    t.plan(1);
    http.expect('get', '/api/getbyid/1', 1).reject(err);

    try{
      await users.fetchById('1');
    }catch(e){
      t.is(e, err);
    }
    http.assert();
  });
});
