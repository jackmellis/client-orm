// should add a record to the store but not send any sort of api call
// should merge into an existing record if necessary
// should be synchronous
import test from 'ava-spec';
import ORM from '../../../src';
import sinon from 'sinon';
import mockHttp from 'mock-http-client';
import Storage from '../../../stores/default';
import Record from '../../../src/classes/record';

test.beforeEach(t => {
  let store = { users : [] };
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
      get : 'api/get',
      create : '/api/create',
      update : '/api/update'
    }
  });

  http.expect(/.*/, /.*/, 0);

  t.context = {store, storage, db, http, users};
});
test.afterEach.always(t => {
  t.context.http.assert();
});

test('should add a record to the store', t => {
  let {store, users} = t.context;
  t.is(store.users.length, 0);
  let user = users.create({
    name : 'Bob',
    permission : '1'
  });
  t.is(store.users.length, 0);
  user.add();
  t.is(store.users.length, 1);
});
test('should happen synchronously', t => {
  let {users} = t.context;
  let user = users.create();
  let result = user.add();
  t.false(!!result.then);
})
test('should update an existing record in the store', t => {
  let {users, store} = t.context;
  store.users.push({
    id : '1',
    name : 'Bob',
    permission : 1
  });
  let user = users.create({
    id : 1,
    name : 'Fred',
    permission : 2
  });
  t.is(store.users.length, 1);
  user.add();
  t.is(store.users.length, 1);

  t.is(store.users[0].id, '1');
  t.is(store.users[0].name, 'Fred');
  t.is(store.users[0].permission, 2);
});
test('should store a plain object, not an instance of Record', t => {
  let {users, store} = t.context;
  let user = users.create();
  user.add();

  t.true(user instanceof Record);
  t.false(store.users[0] instanceof Record);
});
test('should still be the same object reference', t => {
  let {users, store} = t.context;
  let existing = {
    id : '1',
    name : 'Bob',
    permission : 1
  };
  store.users.push(existing);
  let user = users.create({
    id : 1,
    name : 'Fred',
    permission : 2
  });
  user.add();

  t.is(store.users[0], existing);
});
test('should have new values, such as ID set', async t => {
  let {users} = t.context;
  let user = users.create();
  user.name = 'bob';
  user.add();

  t.truthy(user.id);
  t.is(user.name, 'bob');
});
