import { InterfaceConnectionProps } from 'src/InterfaceConnectionProps'

export interface InterfaceNamedConnection {
  props?: InterfaceConnectionProps
  storeName: string
  servicePath?: string
  connectionName: string
  connection?: any
  connectHandlerName?: string
  disconnectHandlerName?: string
  shouldEnsure?: boolean
  ensureHandlerName?: string
}
