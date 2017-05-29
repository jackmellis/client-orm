import test from 'ava-spec';
import sinon from 'sinon';
import ORM from '../../../src';
import mockHttp from 'mock-http-client';
import Storage from '../../../stores/default';

test.beforeEach(t => {
  let store = {
    users : [
      {
        id : '1',
        name : 'One',
        permission : 1
      },
      {
        id : '2',
        name : 'Two',
        permission : 2
      },
      {
        id : '3',
        name : 'Three',
        permission : 3
      }
    ]
  };
  let storage = Storage(store);
  let http = mockHttp();
  let db = new ORM({storage, http});
  let users = db.define({
    name : 'users',
    fields : {
      id : String,
      name : String,
      permission : Number
    },
    api : {
      delete : 'api/delete/{od}'
    }
  });

  http.expect('delete', /.*/, 0);

  t.context = {store, storage, http, db, users};
});
test.afterEach(t => {
  t.context.http.assert();
});

test('should remove a record from the store', async t => {
  let {users, store} = t.context;
  t.is(store.users.length, 3);
  await users.getById('2').remove();
  t.is(store.users.length, 2);
});
test('should happen synchronously', t => {
  let {users, store} = t.context;
  t.is(store.users.length, 3);
  users.getById('2').remove();
  t.is(store.users.length, 2);
});
test('should not do anything if record hasnt been added to the store', async t => {
  let {users, store} = t.context;
  t.is(store.users.length, 3);
  let user = users.create({id : '9'});
  await user.remove();
  t.is(store.users.length, 3);
});
