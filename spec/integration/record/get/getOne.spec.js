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

test.group('getOne', test => {
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
        get : '/api/get',
        getOne : '/api/getone'
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
    http.when(/\/api\/getone.*/).return({
      data : {
        id : '1',
        name : 'One',
        permission : 1
      }
    });

    return t.context;
  }
  test('should return undefined if not found', t => {
    let {users} = setup(t);
    let one = users.getOne();
    t.is(one, undefined);
  });
  test('should attempt to fetch records', async t => {
    let {users, http} = setup(t);
    http.expect('/api/getone?permission=9').stop();
    let one = users.getOne({permission:9});
    await Promise.resolve();
    http.assert();
    t.pass();
  });
  test('should return a matching record', async t => {
    let {users} = setup(t);
    await users.fetch();
    let one = users.getOne({permission:1});
    t.not(one, undefined);
    t.is(one.id, '1');
    t.is(one.name, 'One');
    t.is(one.permission, 1);
  });
  test('if no query, just return the first record', async t => {
    let {users} = setup(t);
    await users.fetch();
    let one = users.getOne();
    t.not(one, undefined);
    t.is(one.id, '1');
    t.is(one.name, 'One');
    t.is(one.permission, 1);
  });
});
