import test from 'ava-spec';
import sinon from 'sinon';
import ORM from '../../../src';
import mockHttp from 'mock-http-client';
import Storage from '../../../stores/default';

test.group('create', test => {
  function setup(t){
    let store = {
      users : [
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
        create : '/api/create'
      }
    });

    return {store, storage, http, db, users};
  }
  test('if it doesnt have an id, call create', t => {
    let {users} = setup(t);
    let user = users.create();
    sinon.stub(users.$collection, 'create');
    user.save();
    t.true(users.$collection.create.called);
  });
  test('if it has an id but it isnt saved, call create', t => {
    let {users} = setup(t);
    let user = users.create();
    user.id = 'foo-id';
    sinon.stub(users.$collection, 'create');
    user.save();
    t.true(users.$collection.create.called);
  });
  test('if no api method, it just adds it to the store', async t => {
    let {users, http, store} = setup(t);
    delete users.$collection.api.create;

    t.is(store.users.length, 0);
    http.expect(/.*/, /.*/, 0);

    await users.create().save();

    t.is(store.users.length, 1);
    http.assert();
  });
  test('it sends a post request by default', async t => {
    let {users, http} = setup(t);
    http.expect('post', '/api/create').return({data:{}});

    await users.create().save();

    http.assert();
    t.pass();
  });
  test('it applies the response data to the original record and the store', async t => {
    let {users, http, store} = setup(t);
    http.expect('post', '/api/create').call(config => {
      return {
        data : Object.assign({}, config.data, {name : 'server'})
      };
    });

    let user = users.create();
    user.name = 'client';

    await user.save();

    t.is(store.users[0].name, 'server');
    t.is(user.name, 'server');

    http.assert();
  });
  test('if it fails, it does not add the record to the store', async t => {
    let {users, http, store} = setup(t);
    let err = new Error();
    http.expect('post', '/api/create').reject(err);

    let user = users.create();

    try{
      await user.save();
    }catch(e){
      t.is(e, err);
    }

    t.is(store.users.length, 0);
  });
  test('it waits for any other pending requests', async t => {
    let {users, http} = setup(t);
    let user = new users();
    let resolve;
    http.expect('post', '/api/create', 0);
    http.expect('get', '/api/get', 1).call(() => {
      return new Promise(r => {
        resolve = r;
      });
    });
    users.$collection.api.get = {method : 'get', url : '/api/get'};

    users.fetch();
    user.save();

    await new Promise(resolve => setTimeout(resolve, 50));
    http.assert();

    http.expect('post', '/api/create', 1).return({});
    resolve({data:[]});
    await users.wait();

    http.assert();
    t.pass();
  });
});

test.group('update', test => {
  function setup(t){
    let store = {
      users : [
        {
          id : '1',
          name : 'One',
          permission : 1
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
        update : '/api/update/{id}'
      }
    });

    return {store, storage, http, db, users};
  }
  test('it updates the store synchronously', t => {
    let {users, http, store} = setup(t);
    http.when().stop();
    t.is(store.users.length, 1);
    let user = users.getOne();
    user.name = 'changed';
    user.save();

    t.is(store.users.length, 1);
    t.is(store.users[0].name, 'changed');
  });
  test('if no api method, it just returns', async t => {
    let {users, http, store} = setup(t);
    delete users.$collection.api.update;
    http.expect(/.*/, /.*/, 0);
    let user = users.getOne();
    user.name = 'changed';

    await user.save();

    t.is(store.users[0].name, 'changed');
    http.assert();
  });
  test('it sends a patch request by default', async t => {
    let {users, http} = setup(t);
    http.expect('patch', '/api/update/1').return({data:{}});
    let user = users.getOne();
    user.name = 'changed';

    await user.save();

    http.assert();
    t.pass();
  });
  test('it only sends fields that have changed', async t => {
    let {users, http} = setup(t);
    t.plan(4);
    http.expect('patch', '/api/update/1').call(config => {
      const data = config.data;
      t.is(data.name, 'changed');
      t.is(data.permission, undefined);
      t.false(Object.hasOwnProperty.call(data, 'permission'));
      return {data:{}};
    });
    let user = users.getOne();
    user.name = 'changed';

    await user.save();

    http.assert();
    t.pass();
  });
  test('it applies the response data to the original record and the store', async t => {
    let {users, http, store} = setup(t);
    http.when('patch', '/api/update/1').call(config => {
      return {
        data : {
          id : '1',
          permission : 3
        }
      };
    });
    let user = users.getOne();
    user.name = 'changed';

    await user.save();

    t.is(user.name, 'changed');
    t.is(user.permission, 3);

    t.is(store.users.length, 1);
    t.is(store.users[0].name, 'changed');
    t.is(store.users[0].permission, 3);
  });
  test('if it fails, it reverts the store to its original object, but the record retains the updated values', async t => {
    let {users, http, store} = setup(t);
    http.expect('patch', '/api/update/1').reject(new Error());
    let user = users.getOne();
    user.name = 'changed';
    user.permission = 2;

    let p = user.save();

    t.is(store.users[0].name, 'changed');
    t.is(store.users[0].permission, 2);
    t.is(user.name, 'changed');
    t.is(user.permission, 2);
    t.is(users.getOne().name, 'changed');

    try{
      await p;
    }catch(e){

    }

    t.is(store.users[0].name, 'One');
    t.is(store.users[0].permission, 1);
    t.is(user.name, 'changed');
    t.is(user.permission, 2);
    t.is(users.getOne().name, 'One');
  });
  test('it waits for any other pending requests', async t => {
    let {users, http} = setup(t);
    let user = users.getOne();
    let resolve;
    http.expect('patch', '/api/update/1', 0);
    http.expect('get', '/api/get', 1).call(() => {
      return new Promise(r => {
        resolve = r;
      });
    });
    users.$collection.api.get = {method : 'get', url : '/api/get'};

    users.fetch();
    user.save();

    await new Promise(resolve => setTimeout(resolve, 50));
    http.assert();

    http.expect('patch', '/api/update/1', 1).return({});
    resolve({data:[]});
    await users.wait();

    http.assert();
    t.pass();
  });
});
