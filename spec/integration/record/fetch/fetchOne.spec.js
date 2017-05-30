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

test.group('fetchOne', test => {
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
        getOne : '/api/getone'
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

    let result = await users.fetchOne();

    t.is(result, undefined);
  });
  test('should do a regular fetch if no api address', async t => {
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

    http.expect('get', /\/api\/get/, 1).return({data:[]});
    http.expect('get', /\/api\/getone/, 0).stop();

    users.fetchOne();

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

    http.expect('get', /\/api\/getone/, 0);

    let result = await users.fetchOne();

    t.not(result, undefined);
    t.is(result.id, '1');

    http.assert();
  });
  test('should fetch a single result from the api', async t => {
    let {users, http} = setup(t);
    let user = await users.fetchOne();

    t.is(user.id, '1');
    t.is(user.name, 'One');
  });
  test('should fetch results from the api with a query', async t => {
    let {users, http} = setup(t);
    let user = await users.fetchOne({permission : 1});
    t.is(user.id, '1');

    user = await users.fetchOne({permission : 3});
    t.is(user, undefined);
  });
  test('should wrap the result in a Record', async t => {
    let {users, http} = setup(t);
    let user = await users.fetchOne();
    t.is(typeof user.$set, 'function');
  });
  test('should piggyback onto a previous fetchOne request if the query is the same', async t => {
    let {users, http} = setup(t);
    http.expect('get', '/api/getone?permission=1', 1).return({data:{}});

    users.fetchOne({permission:1});
    users.fetchOne({permission:1});
    users.fetchOne({permission:1});

    await users.wait();

    http.assert();
    t.pass();
  });
  test('should piggyback on to a previous fetch request if the query is the same', async t => {
    let {users, http} = setup(t);
    http.expect('get', '/api/getone?permission=1', 0).stop();
    http.expect('get', '/api/get?permission=1', 1).return({data:[]});

    users.fetch({permission:1});
    users.fetchOne({permission:1});
    users.fetchOne({permission:1});

    await users.wait();

    http.assert();
    t.pass();
  });
  test('should throw an error if the api request fails', async t => {
    let {users, http} = setup(t);
    let err = new Error();
    http.expect('get', '/api/getone?permission=1').reject(err);
    t.plan(1);

    try{
      await users.fetchOne({permission:1});
    }catch(e){
      t.is(e, err);
    }

    http.assert();
  });
});
