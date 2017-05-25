import test from 'ava-spec';
import ORM from '../../src';

test.group('new ORM', test => {
  test('should create a new database object', t => {
    let db = new ORM();
    t.true(db instanceof ORM);
  });

  test('should accept a timeToLive property', t => {
    let db = new ORM({timeToLive : 5000});
    t.is(db.$timeToLive, 5000);
  });
  test('should accept a storage property', t => {
    let storage = require('../../stores/default')();
    let db = new ORM({storage});
    t.is(db.$storage, storage);
  });
  test('should accept a http property', t => {
    let http = () => {};
    let db = new ORM({http});
    t.is(db.$http, http);
  });

  test('should default the timeToLive and storage values', t => {
    let db = new ORM();
    t.is(typeof db.$timeToLive, 'number');
    t.is(db.$timeToLive, 1000 * 60 * 5);

    t.is(typeof db.$storage, 'object');
  });

  test('should have a define method', t => {
    let db = new ORM();
    t.is(typeof db.define, 'function');
  });
  test('should have a collection method', t => {
    let db = new ORM();
    t.is(typeof db.collection, 'function');
  });
});

test.group('define', test => {
  test('should return a new Table', t => {
    let db = new ORM();
    let users = db.define({
      name : 'users',
      fields : {
        id : String
      }
    });

    t.is(typeof users, 'function');
    t.is(typeof users.get, 'function');
    t.is(typeof users.$collection, 'object');
    t.is(users.$collection, db.$collections[0]);
  });
});

test.group('collection', test => {
  test('collection should return a collection by name', t => {
    let db = new ORM();
    let users = db.define({
      name : 'users'
    });

    let collection = db.collection('users');

    t.is(collection, users);
  });
});
