import test from 'ava-spec';
import ORM from '../../../src';

test.beforeEach(async t => {
  let db = new ORM();
  let users = db.define({
    name : 'users',
    fields : {
      id : String,
      name : String,
      permission : Number
    }
  });
  let user = users.create({id : '1', name : 'fred', permission : '1'});
  await user.save();

  t.context = {db, users, user};
});

test('it copies the record', t => {
  let {user} = t.context;
  let copy = user.copy();

  t.deepEqual(copy, user);
  t.not(copy, user);
});

test('it should not track changed properties', t => {
  let {user} = t.context;
  let copy = user.copy();

  user.name = 'fred2';
  t.is(user.name, 'fred2');
  t.is(copy.name, 'fred');
});

test('it should not pass changed properites back', t => {
  let {user} = t.context;
  let copy = user.copy();

  copy.name = 'fred3';
  t.is(user.name, 'fred');
  t.is(copy.name, 'fred3');
});

test('it should clone changed properties', t => {
  let {user} = t.context;
  user.name = 'fred2';
  let copy = user.copy();

  t.is(copy.name, 'fred2');
});

test('saving should merge the two objects', async t => {
  let {user} = t.context;

  let copy = user.copy();

  copy.name = 'fred4';

  t.is(user.name, 'fred');
  t.is(copy.name, 'fred4');

  await copy.save();

  t.is(user.name, 'fred4');
  t.is(copy.name, 'fred4');

  user.name = 'fred5';

  t.is(user.name, 'fred5');
  t.is(copy.name, 'fred4');

  await user.save();

  t.is(user.name, 'fred5');
  t.is(copy.name, 'fred5');
});

test('saving with a different id should create a new record', async t => {
  let {user, users} = t.context;

  let copy = user.clone();
  copy.id = 'copy-id';
  copy.name = 'bob';
  await copy.save();

  t.is(user.id, '1');
  t.is(copy.id, 'copy-id');
  t.is(user.name, 'fred');
  t.is(copy.name, 'bob');

  t.is(users.get().length, 2);
});
