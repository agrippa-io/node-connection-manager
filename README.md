# @agrippa-io/node-connection-manager #

### What is this repository for? ###
This module is a Singleton designed to manage Database Connections within
 applications.

### How do I get set up? ###

Simply run the following command in the desired Application:
`npm install @agrippa-io/node-connection-manager`

### Usage ###
#### Initializing the ConnectionStore ####
```
// Importing the package will automatically instantiate the Connection Manager
const ConnectionStore = require('@agrippa-io/connection-manager');
```

#### Creating Connections ####
```
// RECOMMENDATION
// For Security Reasons, use ENVIRONMENT VARIABLES for your connection URIs
const {
    MONGO_URI_PROD,
    MONGO_URI_MEDIA,
} = process.env;

// Mongoose
const mongoose = require('mongoose');
const opts = { useNewUrlParser: true };
// Mongoose connections
const connection_test = mongooose.createConnection('mongodb://localhost:27017/test', opts);
const connection_prod = mongooose.createConnection(MONGO_URI_PROD, opts);
const connection_media_prod = mongooose.createConnection(MONGO_URI_MEDIA, opts);

// Sequalize
const { Sequelize } = require('sequelize');
// Sequalize Connections
const sequalize_prod = new Sequelize(MYSQL_URI_PROD);
```

#### Key Concepts ####
`connection-manager` groups connections by `Store` to help Client
Users conceptualize what type of connection they are accessing.

##### Stores #####
A `TYPE_STORE` Map has been provided to help promote grouping connections by 
popular
Persistence Technologies, including:
 * MONGO
 * MYSQL

The `storeName` is just a string, so you are free to create your own groups
but we recommend sticking to the conventions.

```
// Import STORE constants
const STORE = require('@agrippa-io/connection-manager/stores.constants';
// Access
console.log(STORE.MONGO); // prints 'mongo'
console.log(STORE.MYSQL); // prints 'mysql'
```

##### Named Connections #####
`Named Connections` to simplify the access and registration of connections
within the `ConnectionStore`.
 
`Named Connections` are used to quickly register/retrieve connections. This
helps create self-documented coding patterns and reduces the learning-curve for
using the module and provide a consistent means of map/reduce/filter when
working with the `ConnectionStore` `getter/setter` methods.

`Named Connections` are JSON Objects with the following properties:
 * storeName {String} - Name of the Store
 * connectionName {String} - Unique name for connection
 * connection {Any} - The connection instance
 
Example - `Named Connection`:
```
const namedConnection_test = {
  storeName: STORE.MONGO,
  connectionName: 'test',
  connection: connection_test
};
```
 
#### Registering Connections ####
Continued based on `Create Connections` examples above:
```
// Register a single connection
ConnectionStore.addNamedConnection(
  STORE.MONGO,
  'mongo-test',
  connection_test
);
```

```
// Create Many Named Connections of mixed Stores
const namedConnections = [
    {
      storeName: STORE.MONGO,
      connectionName: 'test',
      connection: connection_test
    },
    {
      storeName: STORE.MONGO,
      connectionName: 'production',
      connection: connection_prod
    },
    {
      storeName: STORE.MYSQL,
      connectionName: 'mysql-production',
      connection: sequalize_prod
    },
];

// Register Many Connections in a single method call
ConnectionStore.addNamedConnections(namedConnections);
```

#### Accessing Connections ####
There are 3 methods for retrieving `Named Connections` from the
 `ConnectionStore`:
 - `getNamedConnections()` - Returns all `Named Connections` inside the
  `ConnectionStore`
 - `getStoreNamedConnections(storeName)` - Returns all `Named Connections` for
  the provided `Store`
 - `getNamedConnection(storeName, connectionName)` - Returns a single
  `Named Connection` or `null` if no matching connection
```
// Get an array of ALL connections in the ConnectionStore
// Returns an Array of Named Connections
const namedConnetions = ConnectionStore.getNamedConnections();

// Get an array of ALL connections for a particular STORE
// Returns an Array of Named Connections
const mongoNamedConnections = ConnectionStore.getStoreNamedConnections
(STORE.MONGO);
const mysqlNamedConnections = ConnectionStore.getStoreNamedConnections
(STORE.MYSQL);

// Get a specific Named Connection
const productionNamedConnection = ConnectionStore.getNamedConnection
(STORE.MONGO, 'production');
```

Access the Connection instance from a `Named Connection`:
```
// Access the connection using dot syntax, index/key or destructuring
const dot_connection = productionNamedConnection.connection;
const index_connection = productionNamedConnection['connection'];
const { 
  connection : destructured_connection
} = productionNamedConnection;
```

#### Removing Connections ####
There are 3 methods for removing `Named Connections` from the
 `ConnectionStore`:
 * `removeNamedConnection(storeName, connectionName)` - Returns removed `Named
   Connections`
 * `removeNamedConnections(namedConnections)` - Returns all removed `Named
 Connections` from `ConnectionStore`
 * `clearNamedConnections()` - Returns all removed `Named Connection` from 
  `ConnectionStore`

```
// Remove a specific Named Connection
const testNamedConnection = ConnectionStore.removeNamedConnection(STORE.MONGO, 'test');

// Remove an array of Named Connections of mixed Stores
// The named connections can omit the connection itself
// Returns an Array of removed Named Connections
const removedNamedConnections = ConnectionStore.removeNamedConnections([
    { storeName: STORE.MONGO, connectionName: 'production' },
    { storeName: STORE.MYSQL, connectionName: 'production' },
]);

// Remove ALL connections in the ConnectionStore
// Returns an Array of Named Connections
const removedRemainingNamedConnetions = ConnectionStore.clearNamedConnections();
```

#### READ-ONLY Class Properties ####
You can access a JSON Object of the `ConnectionStore` current state:
```
console.log(ConnectionStore.namedConnections);
```

#### DEBUGGING ####
We have provided `ConnectionStore.debug()` that will log the state of the 
`ConnectionStore` at the time of invocation:

```
// Prints the State of the ConnectionStore
ConnectionStore.debug();
```

### Testing ###
Execute the following command within the repository:
`npm test`

