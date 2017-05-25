import test from 'ava-spec';
import ORM from '../../../src';

test.group('fetch', test => {
  test.todo('should just return an empty list if no api address');
  test.todo('should fetch results from the api');
  test.todo('should fetch results from the api with a query');
  test.todo('should filter the results');
  test.todo('should wrap the results in Record classes');
  test.todo('should piggyback onto a previous fetch request if the query is the same');
  test.todo('should piggyback onto a previous blank fetch request but still filter the results');
  test.todo('should fetch from the api even the cached response is valid');
  test.todo('should throw an error if the api request fails');
  test.todo('should wait until all other api calls have completed before fetching');
});

test.group('fetchOne', test => {
  test.todo('should just return undefined if no api address');
  test.todo('should do a regular fetch if no api address');
  test.todo('should still return just one from fetch request');
  test.todo('should fetch a single result from the api');
  test.todo('should fetch results from the api with a query');
  test.todo('should wrap the result in a Record');
  test.todo('should piggyback onto a previous fetchOne request if the query is the same');
  test.todo('should piggyback ont a previous fetch request if the query is the same');
  test.todo('should throw an error if the api request fails');
  test.todo('should wait until all other api calls have completed before fetching');
});

test.group('fetchById', test => {
  test.todo('should just return undefined if no api address');
  test.todo('should do a regular fetch if no api address');
  test.todo('should still return just one from fetch request');
  test.todo('should do a fetchOne if no api address');
  test.todo('should still return just one from fetchOne request');
  test.todo('should fetch a single result from the api');
  test.todo('should wrap the result in a Record');
  test.todo('should piggyback onto a previous fetchById request if the query is the same');
  test.todo('should piggyback onto a previous fetchOne request if the query is the same');
  test.todo('should piggyback ont a previous fetch request if the query is the same');
  test.todo('should throw an error if the api request fails');
  test.todo('should wait until all other api calls have completed before fetching');
});
