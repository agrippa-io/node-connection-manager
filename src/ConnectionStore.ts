import { InterfaceNamedConnection } from './InterfaceNamedConnection'

class ConnectionStore {
  private static instance: ConnectionStore | null
  private _namedConnections: Record<string, InterfaceNamedConnection | Object>

  /**
   * Ensures ConnectionStore is a SINGLETON
   *
   * @returns {ConnectionStore}
   */
  constructor() {
    if (!ConnectionStore.instance) {
      // Initialize namedConnections to an Empty Object
      this._namedConnections = {}
      ConnectionStore.instance = this
    }
    return ConnectionStore.instance
  }

  get namedConnections() {
    return this._namedConnections
  }

  set namedConnections(noop) {
    throw new Error('ConnectionStore.namedConnections is a private variable and cannot be assigned')
  }

  /**
   * Adds many Named Connections to ConnectionStore
   *
   * @param namedConnections [{
   *   storeName String - Name of Store,
   *   connectionName String - Name of Connection,
   *   connection - Connection
   * }]
   * @returns [{
   *   storeName String - Name of Store,
   *   connectionName String - Name of Connection,
   *   connection - Connection
   * }]
   */
  addNamedConnections(namedConnections: InterfaceNamedConnection[]) {
    for (const namedConnection of namedConnections) {
      const { storeName, connectionName, connection } = namedConnection
      // Ensure Compliant Named Objects
      if (!storeName) {
        throw new Error("'storeName' is required to add a Named Connection")
      }
      if (!connectionName) {
        throw new Error("Named Connections require a 'name'")
      }
      if (!connection) {
        throw new Error("Named Connections require a 'connection'")
      }
      // Add Connection
      this.addNamedConnection(storeName, connectionName, connection)
    }
    return namedConnections
  }

  /**
   * Adds a Named Connection to the Connection Manager
   *
   * @param storeName String - Persistence Store Key (See STORE constant for naming conventions)
   * @param connectionName String - Name of the connection
   * @param connection Any - Connection to Persistence Store
   * @returns {connection} Any - Connection to Persistence Store
   */
  addNamedConnection(storeName: string, connectionName: string, connection: any) {
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
      storeNamedConnections.forEach((namedConnection) => _namedConnections.push(namedConnection))
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
      ? Object.keys(connections).map((connectionName) => ({
          storeName,
          connectionName,
          connection: connections[connectionName],
        }))
      : []
  }

  /**
   * Gets a connection from the ConnectionStore if exists
   *
   * @param storeName String - Name of the Store
   * @param connectionName String - Name of Connection
   * @returns {null|*} - Returns the connection if exists, otherwise null
   */
  getNamedConnection(storeName, connectionName) {
    if (!storeName) {
      throw new Error("'storeName' is required to add a Named Connection")
    }
    if (!connectionName) {
      throw new Error("'connectionName' is required to add a Named Connection")
    }
    // Return connection or null
    return this._namedConnections[storeName] && this._namedConnections[storeName][connectionName]
      ? this._namedConnections[storeName][connectionName]
      : null
  }

  /**
   * Removes all provided Named Collections from the CollectionManager
   *
   * @param namedConnections
   * @returns {[namedConnections]} - Returns Array of Named Connections
   */
  removeNamedConnections(namedConnections: InterfaceNamedConnection[]) {
    const _removedNamedConnections = []
    for (const namedConnection of namedConnections) {
      const { storeName, connectionName } = namedConnection

      const _removedNamedConnection = this.removeNamedConnection(storeName, connectionName)

      _removedNamedConnections.push(_removedNamedConnection)
    }
    return _removedNamedConnections
  }

  /**
   * Removes a Named Connection from the ConnectionStore
   *
   * @param storeName String - Persistence Store Key (See STORE constant for naming conventions)
   * @param connectionName String - Name of the connection
   * @returns {null|*} Returns removed connection if exists, otherwise null
   */
  removeNamedConnection(storeName: string, connectionName: string) {
    if (this._namedConnections[storeName]) {
      const connection = this._namedConnections[storeName][connectionName]
      if (connection) {
        delete this._namedConnections[storeName][connectionName]
      }
      return connection
        ? {
            storeName,
            connectionName,
            connection,
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
      const _storeConnections: InterfaceNamedConnection[] = this.getStoreNamedConnections(storeName)
      this.removeNamedConnections(_storeConnections).forEach((namedConnection) => {
        _removedNamedConnections.push(namedConnection)
      })
    }
    return _removedNamedConnections
  }

  /**
   * Logs the state of the ConnectionStore
   */
  debug() {
    console.log('*** Connection Manager - DEBUG - START ***')
    console.log('namedConnections', this._namedConnections)
    console.log('*** Connection Manager - DEBUG -  END  ***')
  }
}

// Ensures ConnectionStore is a Singleton
const instance: ConnectionStore = new ConnectionStore()
Object.freeze(instance)

export default instance
