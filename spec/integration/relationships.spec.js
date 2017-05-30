import test from 'ava-spec';
import sinon from 'sinon';
import ORM from '../../src';
import mockHttp from 'mock-http-client';
import Storage from '../../stores/default';

test.beforeEach(async t => {
  let store = {
    sections : [],
    documents : []
  };
  let storage = Storage(store);
  let http = mockHttp();
  let db = new ORM({storage, http});
  let sections = db.define({
    name : 'sections',
    fields : {
      id : String,
      name : String
    },
    relationships : [
      {
        name : 'documents',
        query : {
          parentId : section => section.id
        }
      }
    ]
  });
  let documents = db.define({
    name : 'documents',
    fields : {
      id : String,
      name : String,
      parentId : String
    },
    relationships : [
      {
        name : 'documents',
        type : 'many',
        query : {
          parentId : document => document.id
        }
      },
      {
        collection : 'sections',
        name : 'parent',
        type : 'one',
        query : {
          id : document => document.parentId
        }
      }
    ]
  });

  await Promise.all([
    sections.create({id : '1', name : 'Section 1'}).create(), // has 2 children
    sections.create({id : '2', name : 'Section 2'}).create(), // has 1 child
    sections.create({id : '3', name : 'Section 3'}).create(), // has no children
    documents.create({id : '4', name : 'Document 1', parentId : '1'}).create(),
    documents.create({id : '5', name : 'Document 2', parentId : '1'}).create(),
    documents.create({id : '6', name : 'Document 3', parentId : '2'}).create(),
    documents.create({id : '7', name : 'Document 4', parentId : '0'}).create(), // has no parent
    documents.create({id : '8', name : 'Document 5', parentId : '4'}).create() // parent is another document
  ]);

  t.is(sections.get().length, 3);
  t.is(documents.get().length, 5);

  await sections.wait();
  await documents.wait();

  t.context = {store, storage, db, sections, documents, http};
});

test.group('one-to-many', test => {
  test('should return many linked records', t => {
    let {sections} = t.context;
    let section = sections.getById('1');
    let documents = section.documents;
    t.is(documents.length, 2);

    let childDocuments = documents[0].documents;
    t.is(childDocuments.length, 1);

    childDocuments = documents[1].documents;
    t.is(childDocuments.length, 0);
  });
  test('should fetch many linked records', async t => {
    let {sections} = t.context;
    let section = sections.getById('1');
    let documents = await section.fetchDocuments();
    t.is(documents.length, 2);

    let childDocuments = await documents[0].fetchDocuments();
    t.is(childDocuments.length, 1);

    childDocuments = await documents[1].fetchDocuments();
    t.is(childDocuments.length, 0);
  });
  test('should delete all records if cascade is set', async t => {
    let {sections, documents} = t.context;
    let section = sections.getById('1');
    sections.$collection.relationships[0].cascade = true;
    await section.delete();

    t.is(sections.get().length, 2);
    t.is(documents.get().length, 3);
  });
  test('should remove but not delete records if cascade is soft', async t => {
    let {sections, documents, http} = t.context;
    let section = sections.getById('1');
    sections.$collection.relationships[0].cascade = 'soft';
    sections.$collection.api.delete = {method : 'delete', url : '/api/delete/{id}'};
    documents.$collection.api.delete = {method : 'delete', url : '/api/delete/{id}'};

    http.expect('delete', /\/api\/delete\/.*/, 1);

    await section.delete();

    t.is(sections.get().length, 2);
    t.is(documents.get().length, 3);

    http.assert();
  });
  test('should only delete the main record if cascade is not set', async t => {
    let {sections, documents} = t.context;
    let section = sections.getById('1');
    sections.$collection.relationships[0].cascade = false;
    await section.delete();

    t.is(sections.get().length, 2);
    t.is(documents.get().length, 5);
  });
});

test.group('one-to-one', test => {
  test('should return a single linked record', t => {
    let {documents} = t.context;
    let document = documents.getById('4');
    let section = document.parent;
    t.false(Array.isArray(section));
    t.is(section.id, document.parentId);
  });
  test('should fetch a single linked record', async t => {
    let {documents} = t.context;
    let document = documents.getById('4');
    let section = await document.fetchParent();
    t.false(Array.isArray(section));
    t.is(section.id, document.parentId);
  });
  test('should delete both records if cascade is set', async t => {
    let {documents, sections} = t.context;
    let document = documents.getById('4');
    documents.$collection.relationships[1].cascade = true;
    sections.$collection.relationships[0].cascade = 'soft';
    // deleting the document should also delete the section which should then delete all child documents!

    await document.delete();

    t.is(sections.get().length, 2);
    t.is(documents.get().length, 3);
  });
  test('should remove but not delete records if cascade is soft', async t => {
    let {sections, documents, http} = t.context;
    let document = documents.getById('4');
    documents.$collection.relationships[1].cascade = 'soft';
    sections.$collection.relationships[0].cascade = true;
    sections.$collection.api.delete = {method : 'delete', url : '/api/delete/{id}'};
    documents.$collection.api.delete = {method : 'delete', url : '/api/delete/{id}'};

    http.expect('delete', /\/api\/delete\/.*/, 1);

    await document.delete();

    t.is(sections.get().length, 2);
    t.is(documents.get().length, 4);

    http.assert();
  });
  test('should only delete the main record if cascade is not set', async t => {
    let {documents, sections} = t.context;
    let document = documents.getById('4');
    documents.$collection.relationships[1].cascade = false;
    sections.$collection.relationships[0].cascade = true;
    // deleting the document should also delete the section which should then delete all child documents!

    await document.delete();

    t.is(sections.get().length, 3);
    t.is(documents.get().length, 4);
  });
});
