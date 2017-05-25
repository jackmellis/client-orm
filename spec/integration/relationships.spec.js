// should be able to have a one-to-many as well as a one-to-one
// if you delete a parent with a cascading relationship, it should delete all children
import test from 'ava-spec';
import ORM from '../../src';

test.group('one-to-one', test => {
  test.todo('should return a single linked record');
  test.todo('should fetch a single linked record');
  test.todo('should delete both records if cascade is set');
  test.todo('should only delete the main record if cascade is not set');
});

test.group('one-to-many', test => {
  test.todo('should return many linked records');
  test.todo('should fetch many linked records');
  test.todo('should delete all records if cascade is set');
  test.todo('should only delete the main record if cascade is not set');
});
