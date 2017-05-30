import test from 'ava-spec';
import sinon from 'sinon';
import mockHttp from 'mock-http-client';
import ORM from '../../../../src';
import Storage from '../../../../stores/default';

test.beforeEach(t => {
  let store = {};
  let storage = Storage(store);
  let http = mockHttp();
  let db = new ORM({storage, http});

  t.context = {store, storage, db, http};
});

test.group('get', test => {
  function setup(t) {
    let {db, http} = t.context;

    let users = db.define({
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
    t.context.users = users;

    http.when(/\/api\/get.*/).return({
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
  test('should return an empty list if nothing found', t => {
    let {users, http} = setup(t);
    http.when().stop();
    let records = users.get();
    t.is(records.length, 0);
  });
  test('should attempt to fetch records', async t => {
    let {users, http} = setup(t);
    let collection = users.$collection;
    sinon.spy(collection, 'fetch');
    http.expect('/api/get?permission=2').return({data:[]});

    let records = users.get({permission : 2});

    await users.wait();

    t.true(collection.fetch.called);
    t.true(collection.fetch.calledWith({permission : 2}));
    http.assert();
    t.is(records.length, 0);
  });
  test('should return a list of fetched records after-the-fact', async t => {
    let {users, http} = setup(t);

    let records = users.get();

    await users.fetch();

    records = users.get();

    t.is(records.length, 4);
  });
  test('should not attempt to fetch records again', async t => {
    let {users, http} = setup(t);
    http.expect('get', '/api/get', 1).return({data : []});

    let records = users.get();
    records = users.get();
    await users.fetch();
    records = users.get();

    http.assert();
    t.pass();
  });
  test('should filter results based on query', async t => {
    let {users, http, store} = setup(t);
    let {data} = await http.get('/api/get');
    store.users = data;

    let records = users.get();
    t.is(records.length, 4);

    records = users.get({id : '2'});
    t.is(records.length, 1);

    records = users.get({permission : 1});
    t.is(records.length, 3);

    records = users.get({permission : 4});
    t.is(records.length, 1);

    records = users.get({permission : 999});
    t.is(records.length, 0);
  });
});
