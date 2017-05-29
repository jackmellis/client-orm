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
    }
  });

  http.expect('delete', /.*/, 0);

  t.context = {store, storage, http, db, users};
});

test('it rolls back any uncommitted changes', async t => {
  let {users} = t.context;
  let user = users.getOne();

  t.is(user.name, 'One');
  t.is(user.permission, 1);

  user.name = 'changed';
  user.permission = 2;

  t.is(user.name, 'changed');
  t.is(user.permission, 2);

  user.restore();

  t.is(user.name, 'One');
  t.is(user.permission, 1);

  user.name = 'changed';
  user.permission = 2;

  t.is(user.name, 'changed');
  t.is(user.permission, 2);

  await user.save();

  user.restore();

  t.is(user.name, 'changed');
  t.is(user.permission, 2);
});
