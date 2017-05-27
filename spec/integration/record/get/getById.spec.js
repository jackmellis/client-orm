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

test.group('getById', test => {
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
        getById : '/api/getbyid/{id}'
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
    http.when(/\/api\/getbyid\/\d/).return({
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
    let one = users.getById('1');
    t.is(one, undefined);
  });
  test('should attempt to fetch records', t => {
    let {http, users} = setup(t);
    http.expect('/api/getbyid/4').stop();
    users.getById('4');
    http.assert();
    t.pass();
  });
  test('should return a matching record', async t => {
    let {users} = setup(t);
    await users.fetch();

    let user = users.getById('4');
    t.is(user.id, '4');
    t.is(user.name, 'Four');
    t.is(user.permission, 4);
  });
  test('should throw if no id provided', t => {
    let {users} = setup(t);

    t.throws(() => users.getById());
  });
});
