import { assert, expect } from 'chai'
import { isEqual } from 'lodash'
import ConnectionStore from '../ConnectionStore'
import ConnectionStore2 from '../ConnectionStore'
import { TYPE_STORE } from '../stores.constants'

const NAMED_CONNECTIONS = [
  {
    storeName: TYPE_STORE.MONGO,
    connectionName: 'edisen-production',
    connection: { mockId: 'A' },
  },
  {
    storeName: TYPE_STORE.MONGO,
    connectionName: 'media-management-production',
    connection: { mockId: 'B' },
  },
  {
    storeName: TYPE_STORE.MYSQL,
    connectionName: 'vigor-league-production',
    connection: { mockId: 'C' },
  },
]

describe('ConnectionStore', () => {
  describe('ConnectionStore should be a Singleton', () => {
    it('should be the same reference if multiple imports', () => {
      assert.equal(ConnectionStore, ConnectionStore2, 'ConnectionStore and ConnectionStore2 are not the same reference')
    })

    it('should have an empty connection map', () => {
      assert.isEmpty(ConnectionStore.namedConnections, 'ConnectionStore namedConnections are not empty')
    })
  })

  describe('READ-ONLY Properties', () => {
    beforeEach(() => {
      ConnectionStore.clearNamedConnections()
      ConnectionStore.addNamedConnections(NAMED_CONNECTIONS)
    })

    it('should have READ-ONLY access to ConnectionStore.namedConnections', () => {
      assert.isNotEmpty(ConnectionStore.namedConnections)
    })

    it('should throw Error if attempting to modify ConnectionStore.namedConnections', () => {
      expect(() => {
        ConnectionStore.namedConnections = {}
      }).to.throw('ConnectionStore.namedConnections is a private variable and cannot be assigned')
    })
  })

  describe('addNamedConnections', () => {
    beforeEach(() => {
      ConnectionStore.clearNamedConnections()
    })

    it('should return an array of Named Connections', () => {
      // Test
      const actual = ConnectionStore.addNamedConnections(NAMED_CONNECTIONS)
      // Validate
      assertArraysAreEqual(actual, NAMED_CONNECTIONS, assertObjectsAreEqual)
    })

    it('should add all Named Connections to the ConnectionStore', () => {
      // Test
      ConnectionStore.addNamedConnections(NAMED_CONNECTIONS)
      // Validate
      const actual = ConnectionStore.getNamedConnections()
      assertArraysAreEqual(actual, NAMED_CONNECTIONS, assertObjectsAreEqual)
    })
  })

  describe('addNamedConnection', () => {
    beforeEach(() => {
      ConnectionStore.clearNamedConnections()
    })

    it('should return the connection', () => {
      // Pre-conditions
      const expected = NAMED_CONNECTIONS[0]
      const { storeName, connectionName, connection } = expected
      // Test
      const actual = ConnectionStore.addNamedConnection(storeName, connectionName, connection)
      // Validate
      assert.equal(actual, expected.connection, 'Return value does not match NameConnection.connection')
    })

    it('should add a single Named Connection', () => {
      // Pre-conditions
      const expected = NAMED_CONNECTIONS[0]
      const { storeName, connectionName, connection } = expected
      // Test
      ConnectionStore.addNamedConnection(storeName, connectionName, connection)
      // Validate
      const actual = ConnectionStore.getNamedConnections()
      assert.equal(actual.length, 1, 'Only 1 Named Connection should exist')
      assertObjectsAreEqual(actual[0], expected)
    })
  })

  describe('getNamedConnections', () => {
    beforeEach(() => {
      ConnectionStore.clearNamedConnections()
      ConnectionStore.addNamedConnections(NAMED_CONNECTIONS)
    })

    it('should return an array of Named Connections', () => {
      // Test
      const actual = ConnectionStore.getNamedConnections()
      // Validate
      assertArraysAreEqual(actual, NAMED_CONNECTIONS, assertObjectsAreEqual)
    })
  })

  describe('getStoreNamedConnections', () => {
    beforeEach(() => {
      ConnectionStore.clearNamedConnections()
      ConnectionStore.addNamedConnections(NAMED_CONNECTIONS)
    })

    it('should return an array of Named Connections', () => {
      // Expected
      const expectedMongo = NAMED_CONNECTIONS.filter((item) => item.storeName === TYPE_STORE.MONGO)
      const expectedSequalize = NAMED_CONNECTIONS.filter((item) => item.storeName === TYPE_STORE.SEQUALIZE)
      // Test
      const actualMongo = ConnectionStore.getStoreNamedConnections(TYPE_STORE.MONGO)
      const actualSequalize = ConnectionStore.getStoreNamedConnections(TYPE_STORE.SEQUALIZE)
      // Validate
      assertArraysAreEqual(actualMongo, expectedMongo, assertObjectsAreEqual)
      assertArraysAreEqual(actualSequalize, expectedSequalize, assertObjectsAreEqual)
    })

    it('should return an empty array if the store does not exist', () => {
      // Test
      const actual = ConnectionStore.getStoreNamedConnections('caous-monkey')
      // Validate
      assert.isEmpty(actual, 'Should be an empty array')
    })
  })

  describe('getNamedConnection', () => {
    beforeEach(() => {
      ConnectionStore.clearNamedConnections()
      ConnectionStore.addNamedConnections(NAMED_CONNECTIONS)
    })

    it('should return the connection for the provided storeName and connectionName', () => {
      // Expected
      const expectedEdisen = NAMED_CONNECTIONS[0].connection
      const expectedMediaManagement = NAMED_CONNECTIONS[1].connection
      const expectedVigorLeague = NAMED_CONNECTIONS[2].connection
      // Test
      const actualEdisen = ConnectionStore.getNamedConnection(TYPE_STORE.MONGO, 'edisen-production')
      const actualMediaManagement = ConnectionStore.getNamedConnection(TYPE_STORE.MONGO, 'media-management-production')
      const actualVigorLeague = ConnectionStore.getNamedConnection(TYPE_STORE.MYSQL, 'vigor-league-production')
      // Validate
      const message = 'actual Connection should equal expected Connection'
      assert.equal(actualEdisen, expectedEdisen, message)
      assert.equal(actualMediaManagement, expectedMediaManagement, message)
      assert.equal(actualVigorLeague, expectedVigorLeague, message)
    })

    it('should return null if the Named Connection was not added', () => {
      // Expected
      const expected = null
      // Test
      const actual = ConnectionStore.getNamedConnection(TYPE_STORE.MONGO, 'caous-monkey')
      // Validate
      assert.equal(actual, expected, 'A getting non-existent Named Connection should return null')
    })
  })

  describe('removeNamedConnections', () => {
    beforeEach(() => {
      ConnectionStore.clearNamedConnections()
      ConnectionStore.addNamedConnections(NAMED_CONNECTIONS)
    })

    it('should return all removed Named Connections', () => {
      // Test
      const actual = ConnectionStore.removeNamedConnections(NAMED_CONNECTIONS)
      // Validate
      assertArraysAreEqual(actual, NAMED_CONNECTIONS, assertObjectsAreEqual)
    })

    it('should remove all provided Named Connections', () => {
      // Test
      ConnectionStore.removeNamedConnections(NAMED_CONNECTIONS)
      // Validate
      const actual = ConnectionStore.getNamedConnections()
      assert.isEmpty(actual, 'No Named Connections should exist')
    })
  })

  describe('removeNamedConnection', () => {
    beforeEach(() => {
      ConnectionStore.clearNamedConnections()
      ConnectionStore.addNamedConnections(NAMED_CONNECTIONS)
    })

    it('should remove provided connection by storeName and connectionName', () => {
      // Test
      const actual = ConnectionStore.removeNamedConnection(TYPE_STORE.MONGO, 'edisen-production')
      // Validate
      assertObjectsAreEqual(actual, NAMED_CONNECTIONS[0])
    })

    it('should return remove Named Connection by storeName and connectionName', () => {
      // Expected
      const expected = null
      // Test
      ConnectionStore.removeNamedConnection(TYPE_STORE.MONGO, 'edisen-production')
      // Validate
      const actual = ConnectionStore.getNamedConnection(TYPE_STORE.MONGO, 'edisen-production')
      assert.equal(actual, expected, 'Named Connection should have been removed')
    })
  })

  describe('clearNamedCollection', () => {
    beforeEach(() => {
      ConnectionStore.addNamedConnections(NAMED_CONNECTIONS)
    })

    it('should remove all connections', () => {
      // Test
      ConnectionStore.clearNamedConnections()
      // Validate
      const actual = ConnectionStore.getNamedConnections()
      assert.isEmpty(actual, 'All connections should have been removed')
    })

    it('should return all removed Name Collections', () => {
      // Test
      const actual = ConnectionStore.clearNamedConnections()
      // Validate
      assertArraysAreEqual(actual, NAMED_CONNECTIONS, assertObjectsAreEqual)
    })
  })
})

function assertArraysAreEqual(actual, expected, itemValidator = (actual: any, expected: any, message: string) => {}) {
  assert.instanceOf(actual, Array, 'actual value is not an Array')
  assert.equal(actual.length, expected.length, 'actual Array does not match expected length')
  actual.forEach((actual, index) => {
    itemValidator(actual, expected[index], `actual[${index}] does not equal expected[${index}]`)
  })
}

function assertObjectsAreEqual(actual: any, expected: any, message: string = 'Values are not equal'): void {
  assert.isTrue(isEqual(actual, expected), message)
}
