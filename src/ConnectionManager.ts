import ConnectionStore from './ConnectionStore'

import { Logger } from '@agrippa-io/node-utils'
import { InterfaceNamedConnection } from './InterfaceNamedConnection'

export interface InterfaceConnectionManagerProps {
  connectionConfig: InterfaceNamedConnection[]
  ConnectionStore: typeof ConnectionStore
}

export class ConnectionManager {
  // Class Properties
  private static instance: ConnectionManager
  private connectionConfig: InterfaceNamedConnection[]
  private ConnectionStore: typeof ConnectionStore

  private constructor(props: InterfaceConnectionManagerProps) {
    this.connectionConfig = props.connectionConfig
    this.ConnectionStore = props.ConnectionStore
  }

  public static getInstance(connectionConfig: InterfaceNamedConnection[] = []): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager({
        connectionConfig,
        ConnectionStore,
      })
    }

    return ConnectionManager.instance
  }

  public getClient(store, connectionName) {
    return ConnectionManager.instance.ConnectionStore.getNamedConnection(store, connectionName)
  }

  public addNamedConnection(storeName, connectionName, connection) {
    ConnectionManager.instance.ConnectionStore.addNamedConnection(storeName, connectionName, connection)
    Logger.info(`Added NamedConnection to ConnectionManager - ${storeName}['${connectionName}']`)
  }

  public removeNamedConnection(storeName, connectionName) {
    ConnectionManager.instance.ConnectionStore.removeNamedConnection(storeName, connectionName)
    Logger.info(`Removed NamedConnection from ConnectionManager - ${storeName}['${connectionName}']`)
  }

  async init(cb: () => {}) {
    try {
      await ConnectionManager.instance.connect()
      await ConnectionManager.instance.ensure()

      await cb()
    } catch (err) {
      Logger.error('Failed Connection Handling', err)
    }
  }

  public getNamedConnections() {
    return ConnectionManager.instance.ConnectionStore.getNamedConnections()
  }

  async connect() {
    for (const config of this.connectionConfig) {
      const { props, storeName, servicePath, connectionName, connectHandlerName } = config

      Logger.info(`${storeName}['${connectionName}'] - Connecting...`)

      try {
        const connectFuncName = connectHandlerName || 'connect'
        const connectHandlerRef = require(`${servicePath}/connection/${connectFuncName}`)
        const connectHandler = typeof connectHandlerRef === 'function' ? connectHandlerRef : connectHandlerRef.default

        const connection = await connectHandler(props)

        config.connection = connection
        Logger.info(`${storeName}['${connectionName}'] - Connected`)

        ConnectionManager.instance.addNamedConnection(storeName, connectionName, connection)
      } catch (err) {
        Logger.error(`${storeName}['${connectionName}'] - Failed to Connect`, err)
      }
    }
  }

  async ensure() {
    for (const config of this.connectionConfig) {
      const { props, storeName, servicePath, connectionName, shouldEnsure, ensureHandlerName } = config

      if (!shouldEnsure) {
        continue
      }

      Logger.info(`${storeName}['${connectionName}'] - Configuring...`)
      try {
        const funcName = ensureHandlerName || 'ensure'
        const handlerRef = require(`${servicePath}/connection/${funcName}`)
        const handler = typeof handlerRef === 'function' ? handlerRef : handlerRef.default

        await handler(props)
        Logger.info(`${storeName}['${connectionName}'] - Configured`)
      } catch (err) {
        Logger.error(`${storeName}['${connectionName}'] - Failed to Configure`, err)
      }
    }
  }

  // TODO - Implement ConnnectionManager.disconnect()
  async disconnect() {
    for (const config of this.connectionConfig) {
      const { props, storeName, servicePath, connectionName, disconnectHandlerName } = config

      Logger.info(`${storeName}['${connectionName}'] - Disconnecting...`)

      try {
        const funcName = disconnectHandlerName || 'disconnect'
        const handlerRef = require(`${servicePath}/connection/${funcName}`)
        const handler = typeof handlerRef === 'function' ? handlerRef : handlerRef.default

        await handler(props)

        ConnectionManager.instance.removeNamedConnection(storeName, connectionName)

        Logger.info(`${storeName}['${connectionName}'] - Disconnected`)
      } catch (err) {
        Logger.error(`${storeName}['${connectionName}'] - Failed to Connect`, err)
      }
    }
  }
}
