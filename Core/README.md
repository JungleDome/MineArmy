## Events

### Control Panel
---
#### Trigger Events
#### controlPanel.testReceived
Fired by core server after `controlPanel.test` event is triggered. Completing the test.
#### controlPanel.stateUpdated
Fired by core server after `controlPanel.updateState` event is triggered. Updating


#### Action Events
#### controlPanel.createBot
#### controlPanel.commandBot
#### controlPanel.queryBot
#### controlPanel.updateState
- Triggers: `controlPanel.stateUpdated`

Refresh
#### controlPanel.test
- Triggers: `controlPanel.testReceived`

Test connection for core server



### Worker
---
#### Trigger Events
##### worker.connected
Fired when a worker server is connected.
##### disconnect
Fired when a worker server is disconnected.
##### worker.botCreated
Fired by worker server when a bot is created.
##### worker.botError
Fired by worker server when a bot has error.
##### worker.botDisconnected
Fired by worker server when a bot is disconnected from its server.
##### worker.queryStatusResponded
Fired by worker server when a bot responded to query status.
##### worker.commandReceived
Fired by worker server when a bot received command.
##### worker.testReceived
Fired by worker server after `worker.test` event is triggered.

#### Action Events
##### worker.createBot(botDetails)
- `botDetails` <any> Details of worker to be created

Tells worker server to create worker from `botDetails`.
##### worker.queryStatus(uuid)
- `uuid` <string> The uuid of a worker
- Triggers: `worker.queryStatusResponded`

Tells worker server to return status of the worker.
##### worker.command(uuid, command)
- `uuid` <string> The uuid of a worker
- `command` <string> The command that is given to the worker

Executes a command on the worker.
##### worker.test
- Triggers: `worker.testReceived`

Test connection for worker server