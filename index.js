const STORES = require('./stores.constants')

class ConnectionManager {
  /**
   * Ensures ConnectionManager is a SINGLETON
   *
   * @returns {ConnectionManager|ConnectionManager}
   */
  constructor() {
    if (!ConnectionManager.instance) {
      // Initialize namedConnections to an Empty Object
      this._namedConnections = {}
      ConnectionManager.instance = this
    }
    return ConnectionManager.instance
  }

  get namedConnections() {
    return this._namedConnections
  }

  set namedConnections(noop) {
    throw new Error('ConnectionManager.namedConnections is a private variable and cannot be assigned');
  }

  /**
   * Adds many Named Connections to ConnectionManager
   *
   * @param namedConnections [{
   *   storeName String - Name of Store,
   *   connectionName String - Name of Connection,
   *   connection - Mongo Connection
   * }]
   * @returns [{
   *   storeName String - Name of Store,
   *   connectionName String - Name of Connection,
   *   connection - Mongo Connection
   * }]
   */
  addNamedConnections(namedConnections) {
    // Ensure namedConnections is Array
    if (!namedConnections) {
      throw new Error('\'namedConnections\' is required to set Connections')
    }
    if (!namedConnections instanceof Array) {
      throw new Error('\'namedConnections\' must be an Array');
    }

    for (const namedConnection of namedConnections) {
      const { storeName, connectionName, connection } = namedConnection
      // Ensure Compliant Named Objects
      if (!storeName) {
        throw new Error('\'storeName\' is required to add a Named Connection')
      }
      if (!connectionName) {
        throw new Error('Named Connections require a \'name\'')
      }
      if (!connection) {
        throw new Error('Named Connections require a \'connection\'')
      }
      // Add Connection
      this.addNamedConnection(storeName, connectionName, connection)
    }
    return namedConnections
  }

  /**
   * Adds a Named Connection to the Connection Manager
   *
   * @param storeName String - Persistence Store Key (See STORES constant for naming conventions)
   * @param connectionName String - Name of the connection
   * @param connection Any - Connection to Persistence Store
   * @returns {connection} Any - Connection to Persistence Store
   */
  addNamedConnection(storeName, connectionName, connection) {
    if (!storeName) {
      throw new Error('\'storeName\' is required to add a Named Connection')
    }
    if (!connectionName) {
      throw new Error('\'connectionName\' is required to add a Named Connection')
    }
    if (!connection) {
      throw new Error('\'connection\' is required to add a Named Connection')
    }
    // Ensure Store Object
    if (!this._namedConnections[storeName]) {
      this._namedConnections[storeName] = {}
    }
    // Store Named Connection
    this._namedConnections[storeName][connectionName] = connection
    return connection
  }

  /**
   * Returns an Array of ALL Named Connections
   *
   * @returns [{
   *   storeName String - Name of Store,
   *   connectionName String - Name of Connection,
   *   connection Any - Connection
   * }]
   */
  getNamedConnections() {
    const stores = Object.keys(this._namedConnections)
    const _namedConnections = []
    for (const storeName of stores) {
      const storeNamedConnections = this.getStoreNamedConnections(storeName)
      storeNamedConnections.forEach(namedConnection =>
        _namedConnections.push(namedConnection)
      )
    }
    return _namedConnections
  }

  /**
   * Returns an Array of Named Connections for the provided Store
   *
   * @param storeName String - Name of Store
   * @returns [{
   *   storeName String - Name of Store,
   *   connectionName String - Name of Connection,
   *   connection Any - Connection
   * }]
   */
  getStoreNamedConnections(storeName) {
    const connections = this._namedConnections[storeName]
    return connections
      ? Object.keys(connections).map(connectionName => ({
        storeName,
        connectionName,
        connection: connections[connectionName]
      }))
      : []
  }

  /**
   * Gets a connection from the ConnectionManager if exists
   *
   * @param storeName String - Name of the Store
   * @param connectionName String - Name of Connection
   * @returns {null|*} - Returns the connection if exists, otherwise null
   */
  getNamedConnection(storeName, connectionName) {
    if (!storeName) {
      throw new Error('\'storeName\' is required to add a Named Connection')
    }
    if (!connectionName) {
      throw new Error('\'connectionName\' is required to add a Named Connection')
    }
    // Return connection or null
    return this._namedConnections[storeName]
    && this._namedConnections[storeName][connectionName]
      ? this._namedConnections[storeName][connectionName]
      : null
  }

  /**
   * Removes all provided Named Collections from the CollectionManager
   *
   * @param namedConnections
   * @returns {[namedConnections]} - Returns Array of Named Connections
   */
  removeNamedConnections(namedConnections) {
    // Ensure namedConnections is Array
    if (!namedConnections) {
      throw new Error('\'namedConnections\' is required to set Connections')
    }
    if (!namedConnections instanceof Array) {
      throw new Error('\'namedConnections\' must be an Array');
    }
    const _removedNamedConnections = []
    for (const namedConnection of namedConnections) {
      const { storeName, connectionName } = namedConnection
      // Ensure Compliant Named Objects
      if (!storeName) {
        throw new Error('\'storeName\' is required to add a Named Connection')
      }
      if (!connectionName) {
        throw new Error('Named Connections require a \'name\'')
      }
      // Add Connection
      const _removedNamedConnection = this.removeNamedConnection(storeName, connectionName)
      _removedNamedConnections.push(_removedNamedConnection)
    }
    return _removedNamedConnections
  }

  /**
   * Removes a Named Connection from the ConnectionManager
   *
   * @param storeName String - Persistence Store Key (See STORES constant for naming conventions)
   * @param connectionName String - Name of the connection
   * @returns {null|*} Returns removed connection if exists, otherwise null
   */
  removeNamedConnection(storeName, connectionName) {
    if (!storeName) {
      throw new Error('\'storeName\' is required to remove a connection')
    }
    if (!connectionName) {
      throw new Error('\'connectionName\' is required to remove a connection')
    }
    if (this._namedConnections[storeName]) {
      const connection = this._namedConnections[storeName][connectionName]
      if (connection) {
        delete this._namedConnections[storeName][connectionName]
      }
      return connection
        ? {
            storeName,
            connectionName,
            connection
          }
        : null
    }
    return null
  }

  /**
   * Clears all connections
   *
   * @returns {{}} - Returns new connection state
   */
  clearNamedConnections() {
    const _removedNamedConnections = []
    for (const storeName of Object.keys(this._namedConnections)) {
      const _storeConnections = this.getStoreNamedConnections(storeName)
      this.removeNamedConnections(_storeConnections)
        .forEach(namedConnection => {
        _removedNamedConnections.push(namedConnection)
      })
    }
    return _removedNamedConnections
  }

  /**
   * Logs the state of the ConnectionManager
   */
  debug() {
    console.log('*** Connection Manager - DEBUG - START ***')
    console.log('namedConnections', this._namedConnections)
    console.log('*** Connection Manager - DEBUG -  END  ***')
  }

  /**
   * Adds a Named Mongo Connection
   *
   * @param connectionName - Name of Connection
   * @param connection - Mongo Connection
   * @returns {connection} - Mongo Connection
   */
  addMongoConnection(connectionName, connection) {
    return this.addNamedConnection(STORES.MONGO, connectionName, connection)
  }

  /**
   * Gets a Mongo connection from the ConnectionManager if exists
   *
   * @param connectionName String - Name of the connection
   * @returns {null|*} - Returns the connection if exists, otherwise null
   */
  getMongoConnection(connectionName) {
    return this.getNamedConnection(STORES.MONGO, connectionName)
  }

  /**
   * Removes Mongo Connection from ConnectionManager
   *
   * @param connectionName String - Name of Connection
   * @returns {null|*} Returns removed connection if exists, otherwise null
   */
  removeMongoConnection(connectionName) {
    return this.removeNamedConnection(STORES.MONGO, connectionName)
  }

}

// Ensures ConnectionManager is a Singleton
const instance = new ConnectionManager();
Object.freeze(instance);

module.exports = instance;
