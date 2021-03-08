const { assert, expect } = require('chai');
const { isEqual } = require('lodash');
const ConnectionManager = require('../index');
const ConnectionMagager2 = require('../index');
const STORE = require('../stores.constants');

const NAMED_CONNECTIONS = [
  {
    storeName: STORE.MONGO,
    connectionName: 'edisen-production',
    connection: { mockId: 'A' }
  },
  {
    storeName: STORE.MONGO,
    connectionName: 'media-management-production',
    connection: { mockId: 'B' }
  },
  {
    storeName: STORE.MYSQL,
    connectionName: 'vigor-league-production',
    connection: { mockId: 'C' }
  }
];

describe('ConnectionManager', () => {

  describe('ConnectionManager should be a Singleton' , () => {
    it('should be the same reference if multiple imports', () => {
      assert.equal(ConnectionManager, ConnectionMagager2, 'ConnectionManager and ConnectionManager2 are not the same reference');
    });

    it('should have an empty connection map', () => {
      assert.isEmpty(ConnectionManager.namedConnections, 'ConnectionManager namedConnections are not empty')
    });
  });

  describe('READ-ONLY Properties', () => {
    beforeEach(() => {
      ConnectionManager.clearNamedConnections();
      ConnectionManager.addNamedConnections(NAMED_CONNECTIONS);
    });

    it('should have READ-ONLY access to ConnectionManager.namedConnections', () => {
      assert.isNotEmpty(ConnectionManager.namedConnections);
    });

    it('should throw Error if attempting to modify ConnectionManager.namedConnections', () => {
      expect(() => {
        ConnectionManager.namedConnections = {}
      }).to.throw('ConnectionManager.namedConnections is a private variable and cannot be assigned')
    });

    it('should not be able to set ConnectionManager._namedCollections', () => {
      ConnectionManager._namedConnections = {}
      assert.isNotEmpty(ConnectionManager._namedConnections)
    });
  });

  describe('addNamedConnections', () => {
    beforeEach(() => {
      ConnectionManager.clearNamedConnections();
    });

    it('should return an array of Named Connections', () => {
      // Test
      const actual = ConnectionManager.addNamedConnections(NAMED_CONNECTIONS);
      // Validate
      assertArraysAreEqual(actual, NAMED_CONNECTIONS, assertObjectsAreEqual);
    });

    it('should add all Named Connections to the ConnectionManager', () => {
      // Test
      ConnectionManager.addNamedConnections(NAMED_CONNECTIONS);
      // Validate
      const actual = ConnectionManager.getNamedConnections();
      assertArraysAreEqual(actual, NAMED_CONNECTIONS, assertObjectsAreEqual);
    });
  });

  describe('addNamedConnection', () => {
    beforeEach(() => {
      ConnectionManager.clearNamedConnections();
    });

    it('should return the connection', () => {
      // Pre-conditions
      const expected = NAMED_CONNECTIONS[0];
      const { storeName, connectionName, connection } = expected;
      // Test
      const actual = ConnectionManager.addNamedConnection(storeName, connectionName, connection);
      // Validate
      assert.equal(actual, expected.connection, 'Return value does not match NameConnection.connection');
    });

    it('should add a single Named Connection', () => {
      // Pre-conditions
      const expected = NAMED_CONNECTIONS[0];
      const { storeName, connectionName, connection } = expected;
      // Test
      ConnectionManager.addNamedConnection(storeName, connectionName, connection);
      // Validate
      const actual = ConnectionManager.getNamedConnections();
      assert.equal(actual.length, 1, 'Only 1 Named Connection should exist');
      assertObjectsAreEqual(actual[0], expected);
    });
  });

  describe('getNamedConnections', () => {
    beforeEach(() => {
      ConnectionManager.clearNamedConnections();
      ConnectionManager.addNamedConnections(NAMED_CONNECTIONS);
    });

    it('should return an array of Named Connections', () => {
      // Test
      const actual = ConnectionManager.getNamedConnections();
      // Validate
      assertArraysAreEqual(actual, NAMED_CONNECTIONS, assertObjectsAreEqual);
    });
  });

  describe('getStoreNamedConnections', () => {
    beforeEach(() => {
      ConnectionManager.clearNamedConnections();
      ConnectionManager.addNamedConnections(NAMED_CONNECTIONS);
    });

    it('should return an array of Named Connections', () => {
      // Expected
      const expectedMongo = NAMED_CONNECTIONS.filter(item => item.storeName === STORE.MONGO)
      const expectedSequalize = NAMED_CONNECTIONS.filter(item => item.storeName === STORE.SEQUALIZE)
      // Test
      const actualMongo = ConnectionManager.getStoreNamedConnections(STORE.MONGO);
      const actualSequalize = ConnectionManager.getStoreNamedConnections(STORE.SEQUALIZE);
      // Validate
      assertArraysAreEqual(actualMongo, expectedMongo, assertObjectsAreEqual);
      assertArraysAreEqual(actualSequalize, expectedSequalize, assertObjectsAreEqual);
    });

    it('should return an empty array if the store does not exist', () => {
      // Test
      const actual = ConnectionManager.getStoreNamedConnections('caous-monkey');
      // Validate
      assert.isEmpty(actual, 'Should be an empty array');
    });
  });

  describe('getNamedConnection', () => {
    beforeEach(() => {
      ConnectionManager.clearNamedConnections();
      ConnectionManager.addNamedConnections(NAMED_CONNECTIONS);
    });

    it('should return the connection for the provided storeName and connectionName', () => {
      // Expected
      const expectedEdisen = NAMED_CONNECTIONS[0].connection;
      const expectedMediaManagement = NAMED_CONNECTIONS[1].connection;
      const expectedVigorLeague = NAMED_CONNECTIONS[2].connection;
      // Test
      const actualEdisen = ConnectionManager.getNamedConnection(STORE.MONGO, 'edisen-production');
      const actualMediaManagement = ConnectionManager.getNamedConnection(STORE.MONGO, 'media-management-production');
      const actualVigorLeague = ConnectionManager.getNamedConnection(STORE.MYSQL, 'vigor-league-production');
      // Validate
      const message = 'actual Connection should equal expected Connection';
      assert.equal(actualEdisen, expectedEdisen, message);
      assert.equal(actualMediaManagement, expectedMediaManagement, message);
      assert.equal(actualVigorLeague, expectedVigorLeague, message);
    });

    it('should return null if the Named Connection was not added', () => {
      // Expected
      const expected = null;
      // Test
      const actual = ConnectionManager.getNamedConnection(STORE.MONGO, 'caous-monkey');
      // Validate
      assert.equal(actual, expected, 'A getting non-existent Named Connection should return null')
    })
  });

  describe('removeNamedConnections', () => {
    beforeEach(() => {
      ConnectionManager.clearNamedConnections();
      ConnectionManager.addNamedConnections(NAMED_CONNECTIONS);
    });

    it('should return all removed Named Connections', () => {
      // Test
      const actual = ConnectionManager.removeNamedConnections(NAMED_CONNECTIONS);
      // Validate
      assertArraysAreEqual(actual, NAMED_CONNECTIONS, assertObjectsAreEqual)
    });

    it('should remove all provided Named Connections', () => {
      // Test
      ConnectionManager.removeNamedConnections(NAMED_CONNECTIONS);
      // Validate
      const actual = ConnectionManager.getNamedConnections();
      assert.isEmpty(actual, 'No Named Connections should exist');
    });
  });

  describe('removeNamedConnection', () => {
    beforeEach(() => {
      ConnectionManager.clearNamedConnections();
      ConnectionManager.addNamedConnections(NAMED_CONNECTIONS);
    });

    it('should remove provided connection by storeName and connectionName', () => {
      // Test
      const actual = ConnectionManager.removeNamedConnection(STORE.MONGO, 'edisen-production');
      // Validate
      assertObjectsAreEqual(actual, NAMED_CONNECTIONS[0])
    });

    it('should return remove Named Connection by storeName and connectionName', () => {
      // Expected
      const expected = null;
      // Test
      ConnectionManager.removeNamedConnection(STORE.MONGO, 'edisen-production');
      // Validate
      const actual = ConnectionManager.getNamedConnection(STORE.MONGO, 'edisen-production');
      assert.equal(actual, expected,'Named Connection should have been removed');
    });
  });

  describe('clearNamedCollection', () => {
    beforeEach(() => {
      ConnectionManager.addNamedConnections(NAMED_CONNECTIONS);
    });

    it('should remove all connections', () => {
      // Test
      ConnectionManager.clearNamedConnections();
      // Validate
      const actual = ConnectionManager.getNamedConnections();
      assert.isEmpty(actual, 'All connections should have been removed');
    });

    it('should return all removed Name Collections', () => {
      // Test
      const actual = ConnectionManager.clearNamedConnections();
      // Validate
      assertArraysAreEqual(actual, NAMED_CONNECTIONS, assertObjectsAreEqual);
    });
  });


});


function assertArraysAreEqual(actual, expected, itemValidator = (actual, expected, message) => {}) {
  assert.instanceOf(actual, Array, 'actual value is not an Array');
  assert.equal(actual.length, expected.length, 'actual Array does not match expected length');
  actual.forEach((actual, index) => {
    itemValidator(actual, expected[index],`actual[${index}] does not equal expected[${index}]`);
  });
}

function assertObjectsAreEqual(actual, expected, message) {
  assert.isTrue(isEqual(actual, expected), message);
}
