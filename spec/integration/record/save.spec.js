import test from 'ava-spec';
import ORM from '../../../src';

test.group('create', test => {
  test.todo('if it doesnt have an id, call create');
  test.todo('if it has an id but it isnt saved, call create');
  test.todo('if no api method, it just adds it to the store');
  test.todo('it sends a post request by default');
  test.todo('it sends a custom method type based on the api config');
  test.todo('it applies the response data to the original record and the store');
  test.todo('if it fails, it does not add the record to the store');
  test.todo('it waits for any other pending requests');
});

test.group('update', test => {
  test.todo('it updates the store synchronously');
  test.todo('if no api method, it just returns');
  test.todo('it sends a patch request by default');
  test.todo('it sends a custom method type based on the api config');
  test.todo('it applies the response data to the original record and the store');
  test.todo('if it fails, it reverts the store to its original object, but the record retains the updated values');
  test.todo('it waits for any other pending requests');
});
