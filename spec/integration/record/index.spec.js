import test from 'ava-spec';
import ORM from '../../../src';

test.group('new Record', test => {
  function setup(t) {
    let db = new ORM();

    let User = db.define({
      name : 'users',
      fields : {
        id : String,
        name : String,
        permission : Number
      }
    });
    t.context.db = db;
    t.context.User = User;
    return t.context;
  }
  test('should create a new record', t => {
    let {User} = setup(t);
    let user = new User();

    t.true(user instanceof User);
    t.true(Object.hasOwnProperty.call(user, 'id'));
    t.true(Object.hasOwnProperty.call(user, 'name'));
    t.true(Object.hasOwnProperty.call(user, 'permission'));
  });
  test('should accept a set of values', t => {
    let {User} = setup(t);
    let user = new User({id : '1', name : 'Bob', permission : 3});

    t.is(user.id, '1');
    t.is(user.name, 'Bob');
    t.is(user.permission, 3);
  });
  test('should ignore non-valid values', t => {
    let {User} = setup(t);
    let user = new User({id : '1', extra : true, foo : 'bah'});

    t.is(user.id, '1');
    t.is(user.extra, undefined);
    t.is(user.foo, undefined);
  });

  test('should return the initialised value', t => {
    let {User} = setup(t);
    let user = new User({id : '1'});

    t.is(user.id, '1');

    user = new User();
    t.is(user.id, undefined);
  });
  test('should set a new value', t => {
    let {User} = setup(t);
    let user = new User({name : 'bob'});

    t.is(user.name, 'bob');
    user.name = 'fred';
    t.is(user.name, 'fred');
  });

  test('should coerce the value into the correct format', t => {
    let {User} = setup(t);
    let user = new User({id : 1, name : true, permission : '5'});

    t.is(user.id, '1');
    t.is(user.name, 'true');
    t.is(user.permission, 5);
  });
});

test.group('create', test => {
  test('should create a new instance of the record', t => {
    let db = new ORM();
    let users = db.define({
      name : 'users'
    });

    let user = users.create();
    t.true(user instanceof users);
  });
});
