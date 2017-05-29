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
      delete : '/api/delete/{id}'
    }
  });

  http.when('delete', /\/api\/delete\/\d/).return({});

  t.context = {store, storage, http, db, users};
});

test('it removes the record from the store synchronously', t => {
  let {users} = t.context;

  t.is(users.get().length, 3);
  let user = users.getById('1');
  user.delete();

  t.is(users.get().length, 2);
});
test('if no api method, it just returns', async t => {
  let {users, http} = t.context;
  delete users.$collection.api.delete;
  http.expect('delete', /.*/, 0);

  let user = users.getById('1');
  await user.delete();

  http.assert();
  t.pass();
});
test('it sends a delete request by default', async t => {
  let {users, http} = t.context;
  http.expect('delete', '/api/delete/2');

  let user = users.getById('2');
  await user.delete();

  http.assert();
  t.pass();
});
test('it sends a custom request method', async t => {
  let {users, http} = t.context;
  users.$collection.api.delete.method = 'put';
  http.expect('put', '/api/delete/2');

  let user = users.getById('2');
  await user.delete();

  http.assert();
  t.pass();
});
test('if it fails, the record is added back into the store', async t => {
  t.plan(4);
  let {users, http} = t.context;
  let err = new Error();
  http.when('delete', /.*/).reject(err);
  let user = users.getById('2');
  t.is(users.get().length, 3);

  try{
    let p = user.delete();
    t.is(users.get().length, 2);
    await p;
  }catch(e){
    t.is(e, err);
    t.is(users.get().length, 3);
  }
});
test.todo('it waits for any other queued methods to complete');
