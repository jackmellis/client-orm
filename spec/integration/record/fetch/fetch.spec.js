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

test.group('fetch', test => {
  function setup(t) {
    t.context.users = t.context.db.define({
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

    return t.context;
  }
  test('should just return an empty list if no api address', async t => {
    let users = t.context.db.define({
      name : 'users',
      fields : {
        id : String,
        name : String,
        permission : Number
      }
    });
    let result = await users.fetch();
    t.is(result.length, 0);
  });
  test('should fetch results from the api', async t => {
    let {users} = setup(t);
    let result = await users.fetch();
    t.is(result.length, 4);
  });
  test('should fetch results from the api with a query', async t => {
    let {users, http} = setup(t);
    http.expect('get', '/api/get?permission=4').stop();
    users.fetch({permission:4});
    http.assert();
    t.pass();
  });
  test('should filter the results', async t => {
    let {users} = setup(t);
    let result = await users.fetch({permission:1});
    t.is(result.length, 3);
  });
  test('should wrap the results in Record classes', async t => {
    let {users} = setup(t);
    t.plan(4);
    let Record = require('../../../../src/classes/record');
    let result = await users.fetch();

    result.forEach(r => t.true(r instanceof Record));
  });
  test('should piggyback onto a previous fetch request if the query is the same', async t => {
    let {users, http} = setup(t);

    http.expect('get', /\/api\/get\?permission=1/, 1).stop();

    users.fetch({permission : 1});
    users.fetch({permission : 1});
    users.fetch({permission : 1});

    http.assert();
    t.pass();
  });
  test('should piggyback onto a previous blank fetch request but still filter the results', async t => {
    let {users, http} = setup(t);

    http.expect('get', '/api/get?permission=1', 0).stop();
    http.expect('get', '/api/get', 1).stop();

    users.fetch();
    users.fetch({permission : 1});
    users.fetch();
    users.fetch({permission : 1});

    http.assert();
    t.pass();
  });
  test('should fetch from the cache if it is still valid', async t => {
    let {users, http} = setup(t);

    http.expect(/.*/, /.*/, 0).stop();
    http.expect('get', '/api/get', 1).return({
      data : [
        {
          id : '11',
          name : 'eleven',
          permission : 1
        },
        {
          id : '12',
          name : 'twelve',
          permission : 12
        }
      ]
    });

    let first = await users.fetch();
    let second = await users.fetch({permission : 1});
    let third = await users.fetch({permission:1});

    http.assert();

    t.is(first.length, 2);
    t.is(second.length, 1);
    t.is(third.length, 1);
    t.is(first[0].name, 'eleven');
    t.is(first[1].name, 'twelve');
    t.is(second[0].name, 'eleven');
    t.is(third[0].name, 'eleven');
  });
  test('should throw an error if the api request fails', async t => {
    let {users, http} = setup(t);
    let error = new Error();
    http.when().reject(error);
    t.plan(2);

    try{
      await users.fetch({permission : 1});
    }catch(err){
      t.is(error, err);
    }
    try{
      await users.fetch();
    }catch(err){
      t.is(error, err);
    }
  });
  test.todo('should wait until all other api calls have completed before fetching');
});
