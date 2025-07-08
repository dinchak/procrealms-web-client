# Procedural Realms Websocket Protocol

This document outlines the websocket protocol used by the Procedural Realms game server. You can connect to the websocket server at the following URL:

[wss://play.proceduralrealms.com/ws](wss://play.proceduralrealms.com/ws)

Note that the server uses the Secure WebSocket protocol (wss://).

## 1. Overview and Basic Flow

The API is built around a JSON-based messaging system over a websocket connection. All messages are JSON objects with a `cmd` field, a `msg` field, and an optional `reqId` for request/response matching.

### Authentication

There are three methods of authentication:

1.  **New User Creation**: A new user is created by sending a `create` command with a unique character name and a password.
2.  **Existing User Login**: An existing user logs in by sending a `login` command with their character name and password.
3.  **Token-Based Login**: A user can also log in by sending a `token` command using a token that is provided by the server upon a previous successful `login` or `create`. This token can be stored on the client and used for subsequent logins.

Once authenticated, the websocket connection is considered "authenticated," and no further authentication information needs to be exchanged for the duration of the connection.

#### Authentication Examples

**1. New User Creation**

*Client to Server:*
```json
{
  "cmd": "create",
  "msg": {
    "name": "NewPlayer",
    "password": "password123",
    "width": 80,
    "height": 24,
    "tutorial": "Y",
    "ttype": "play.proceduralrealms.com"
  },
  "reqId": "..."
}
```

*Server to Client (on success):*
```json
{
  "cmd": "token.success",
  "msg": {
    "name": "NewPlayer",
    "token": "a_very_long_and_secure_token"
  },
  "reqId": "..."
}
```

**2. Existing User Login**

*Client to Server:*
```json
{
  "cmd": "login",
  "msg": {
    "name": "ExistingPlayer",
    "password": "password123",
    "width": 80,
    "height": 24,
    "ttype": "play.proceduralrealms.com"
  },
  "reqId": "..."
}
```

*Server to Client (on success):*
```json
{
  "cmd": "token.success",
  "msg": {
    "name": "ExistingPlayer",
    "token": "a_very_long_and_secure_token"
  },
  "reqId": "..."
}
```

**3. Token-Based Login**

*Client to Server:*
```json
{
  "cmd": "token",
  "msg": {
    "name": "ExistingPlayer",
    "token": "a_very_long_and_secure_token",
    "width": 80,
    "height": 24,
    "ttype": "play.proceduralrealms.com"
  },
  "reqId": "..."
}
```

*Server to Client (on success):*
```json
{
  "cmd": "token.success",
  "msg": {
    "name": "ExistingPlayer",
    "token": "a_very_long_and_secure_token"
  },
  "reqId": "..."
}
```

#### Login Error Responses

When an authentication request fails, the server will respond with one of the following error messages. The `reqId` will match the original request.

*   **`login.validationFailed`**: This indicates that the provided information (e.g., character name, password) did not meet the server's validation criteria. The `msg` field will contain a human-readable error message.
    ```json
    {
      "cmd": "login.validationFailed",
      "msg": "Invalid character name",
      "reqId": "..."
    }
    ```

*   **`login.fail`**: This is a more general failure that can occur during the login or character creation process. The `msg` field will contain a human-readable error message.
    ```json
    {
      "cmd": "login.fail",
      "msg": "Failed to create character",
      "reqId": "..."
    }
    ```

*   **`login.nameExists`**: This error is specific to the `nameExists` check and indicates that the requested character name is already in use.
    ```json
    {
      "cmd": "login.nameExists",
      "msg": "Name is already taken, please choose another",
      "reqId": "..."
    }
    ```

## 2. The Patch System

The server maintains the client's game state using a patch system. The client initially has an empty `gameState` object. The server sends `state.patch` messages containing an array of JSON Patch operations. The client applies these patches to its `gameState` object to keep it in sync with the server.

This approach is efficient as it only sends the changes to the game state, rather than the entire state object, on every update.

*Example `state.patch` message:*
```json
{
  "cmd": "state.patch",
  "msg": {
    "patch": [
      { "op": "replace", "path": "/player/hp", "value": 95 }
    ]
  }
}
```

## 3. The `cmd` and `out` Messages

The `cmd` and `out` messages form the basis of the textual input/output system.

*   **`cmd`**: The client sends `cmd` messages to the server to perform actions in the game. The `msg` field of a `cmd` message is a string containing the command to be executed.
*   **`out`**: The server sends `out` messages to the client to display text in the main output area. The `msg` field of an `out` message is a string containing the text to be displayed.

*Example `cmd` message:*
```json
{
  "cmd": "cmd",
  "msg": "look"
}
```

*Example `out` message:*
```json
{
  "cmd": "out",
  "msg": "You are in a dark room."
}
```

## 4. Entities and Items

Most entities and items in the game are referenced by their `eid` (entity ID) or `iid` (item ID). The `gameState` object often contains arrays of these IDs.

To get detailed information about an entity or item, the client can send `entity`, `entities`, `item`, or `items` messages.

*   **`entity`**: Requests the details of a single entity.
*   **`entities`**: Requests the details of multiple entities.
*   **`item`**: Requests the details of a single item.
*   **`items`**: Requests the details of multiple items.

The server responds with the requested information, which the client can then cache.

*Example `entity` request:*
```json
{
  "cmd": "entity",
  "msg": { "eid": 12345 },
  "reqId": "..."
}
```

*Example `entity` response:*
```json
{
  "cmd": "entity",
  "msg": {
    "eid": 12345,
    "name": "A goblin",
    "hp": 100,
    "max_hp": 100
  },
  "reqId": "..."
}
```

## 5. Additional Messages

The protocol includes several other messages to enhance the client experience:

*   **`room.describe`**: Provides a detailed description of the current room, including an ASCII map.
*   **`entity.attack`** and **`affect.cure`**: Trigger client-side animations for combat and healing.
*   **`channel.msg`**: Handles all chat and communication channels.
*   **`map.settings`**: Configures the client's map display.
*   **`help.topics`**, **`help.entry`**, **`help.search`**: Provide access to the in-game help system.
*   **`client.media.play`**: Instructs the client to play a sound or music track.

## 6. Appendix: Message Types

This appendix contains a comprehensive list of all message types, their arguments, data types, and an example of each.

---

### `create`

Creates a new character.

*   **`msg`**: `Object`
    *   **`name`**: `String` - The desired name for the new character.
    *   **`password`**: `String` - The password for the new character.
    *   **`width`**: `Number` - The width of the client's terminal.
    *   **`height`**: `Number` - The height of the client's terminal.
    *   **`tutorial`**: `String` - Whether the player wants to start in the tutorial (`'Y'` or `'N'`).
    *   **`ttype`**: `String` - A string identifying the client type.

*Example:*
```json
{
  "cmd": "create",
  "msg": {
    "name": "NewPlayer",
    "password": "password123",
    "width": 80,
    "height": 24,
    "tutorial": "Y",
    "ttype": "play.proceduralrealms.com"
  }
}
```

---

### `login`

Logs in an existing character.

*   **`msg`**: `Object`
    *   **`name`**: `String` - The character's name.
    *   **`password`**: `String` - The character's password.
    *   **`width`**: `Number` - The width of the client's terminal.
    *   **`height`**: `Number` - The height of the client's terminal.
    *   **`ttype`**: `String` - A string identifying the client type.

*Example:*
```json
{
  "cmd": "login",
  "msg": {
    "name": "ExistingPlayer",
    "password": "password123",
    "width": 80,
    "height": 24,
    "ttype": "play.proceduralrealms.com"
  }
}
```

---

### `token`

Logs in a character using a previously issued authentication token.

*   **`msg`**: `Object`
    *   **`name`**: `String` - The character's name.
    *   **`token`**: `String` - The authentication token.
    *   **`width`**: `Number` - The width of the client's terminal.
    *   **`height`**: `Number` - The height of the client's terminal.
    *   **`ttype`**: `String` - A string identifying the client type.

*Example:*
```json
{
  "cmd": "token",
  "msg": {
    "name": "ExistingPlayer",
    "token": "a_very_long_and_secure_token",
    "width": 80,
    "height": 24,
    "ttype": "play.proceduralrealms.com"
  }
}
```

---

### `nameExists`

Checks if a character name is already taken.

*   **`msg`**: `Object`
    *   **`name`**: `String` - The name to check.

*Example:*
```json
{
  "cmd": "nameExists",
  "msg": {
    "name": "NewPlayer"
  }
}
```

---

### `state.patch`

Applies a patch to the client's `gameState` object.

*   **`msg`**: `Object`
    *   **`patch`**: `Array` - An array of JSON Patch operations.

*Example:*
```json
{
  "cmd": "state.patch",
  "msg": {
    "patch": [
      { "op": "replace", "path": "/player/hp", "value": 95 }
    ]
  }
}
```

---

### `cmd`

Sends a command from the client to the server for execution.

*   **`msg`**: `String` - The command to be executed.

*Example:*
```json
{
  "cmd": "cmd",
  "msg": "look"
}
```

---

### `out`

Sends a line of text from the server to be displayed in the client's main output window.

*   **`msg`**: `String` - The line of text to display. Can contain ANSI color codes.

*Example:*
```json
{
  "cmd": "out",
  "msg": "You see a goblin here."
}
```

---

### `room.describe`

Sends the description of the current room to the client.

*   **`msg`**: `Object`
    *   **`desc`**: `String` - The textual description of the room.
    *   **`map`**: `Array` - An array of strings representing the room's minimap.

*Example:*
```json
{
  "cmd": "room.describe",
  "msg": {
    "desc": "You are in a dimly lit cave.",
    "map": [
      " # ",
      " @ ",
      "   "
    ]
  }
}
```

---

### `entity`

Requests the details of a single entity.

*   **`msg`**: `Object`
    *   **`eid`**: `Number` - The ID of the entity to fetch.

*Example:*
```json
{
  "cmd": "entity",
  "msg": { "eid": 12345 }
}
```

---

### `entities`

Requests the details of multiple entities.

*   **`msg`**: `Object`
    *   **`eids`**: `Array` - An array of entity IDs to fetch.

*Example:*
```json
{
  "cmd": "entities",
  "msg": { "eids": [12345, 67890] }
}
```

---

### `item`

Requests the details of a single item.

*   **`msg`**: `Object`
    *   **`iid`**: `Number` - The ID of the item to fetch.

*Example:*
```json
{
  "cmd": "item",
  "msg": { "iid": 54321 }
}
```

---

### `items`

Requests the details of multiple items.

*   **`msg`**: `Object`
    *   **`iids`**: `Array` - An array of item IDs to fetch.

*Example:*
```json
{
  "cmd": "items",
  "msg": { "iids": [54321, 98765] }
}
```

---

### `entity.attack`

Notifies the client that an entity has been attacked, for animation purposes.

*   **`msg`**: `Object`
    *   **`target`**: `Number` - The `eid` of the entity being attacked.
    *   **`amount`**: `Number` - The amount of damage dealt.
    *   **`crit`**: `Boolean` - Whether the attack was a critical hit.

*Example:*
```json
{
  "cmd": "entity.attack",
  "msg": {
    "target": 12345,
    "amount": 10,
    "crit": false
  }
}
```

---

### `affect.cure`

Notifies the client that an entity has been healed, for animation purposes.

*   **`msg`**: `Object`
    *   **`target`**: `Number` - The `eid` of the entity being healed.
    *   **`amount`**: `Number` - The amount of health restored.

*Example:*
```json
{
  "cmd": "affect.cure",
  "msg": {
    "target": 12345,
    "amount": 10
  }
}
```

---

### `channel.msg`

Sends a message over a communication channel (e.g., chat, trade, party).

*   **`msg`**: `Object`
    *   **`id`**: `String` - A unique ID for the message.
    *   **`from`**: `String` - The name of the sender.
    *   **`to`**: `String` - The name of the recipient (for tells).
    *   **`channel`**: `String` - The name of the channel.
    *   **`timestamp`**: `Number` - A Unix timestamp of when the message was sent.
    *   **`message`**: `String` - The content of the message.

*Example:*
```json
{
  "cmd": "channel.msg",
  "msg": {
    "id": "...",
    "from": "Player1",
    "to": null,
    "channel": "chat",
    "timestamp": 1678886400,
    "message": "Hello, world!"
  }
}
```

---

### `map.settings`

Sends map configuration settings to the client.

*   **`msg`**: `Object`
    *   **`width`**: `Number` - The width of the side map.
    *   **`height`**: `Number` - The height of the side map.
    *   **`enabled`**: `Boolean` - Whether the side map is enabled.

*Example:*
```json
{
  "cmd": "map.settings",
  "msg": {
    "width": 25,
    "height": 25,
    "enabled": true
  }
}
```

---

### `help.topics`

Sends the list of available help topics to the client.

*   **`msg`**: `Object`
    *   **`topics`**: `Object` - An object containing arrays of help topics, categorized by type (e.g., `skills`, `general`, `commands`).

*Example:*
```json
{
  "cmd": "help.topics",
  "msg": {
    "topics": {
      "skills": ["bash", "kick"],
      "general": ["rules", "faq"],
      "commands": ["look", "get"]
    }
  }
}
```

---

### `help.entry`

Sends the content of a specific help entry to the client.

*   **`msg`**: `Object`
    *   **`entry`**: `String` - The name of the help entry.
    *   **`content`**: `String` - The content of the help entry.

*Example:*
```json
{
  "cmd": "help.entry",
  "msg": {
    "entry": "look",
    "content": "Syntax: look [target]"
  }
}
```

---

### `help.search`

Sends the results of a help search to the client.

*   **`msg`**: `Object`
    *   **`matches`**: `Array` - An array of strings representing the names of matching help entries.

*Example:*
```json
{
  "cmd": "help.search",
  "msg": {
    "matches": ["look", "look in"]
  }
}
```

---

### `client.media.play`

Instructs the client to play a media file (sound or music).

*   **`msg`**: `Object`
    *   **`name`**: `String` - The name/path of the media file to play.

*Example:*
```json
{
  "cmd": "client.media.play",
  "msg": {
    "name": "music/ost/the-nexus.mp3"
  }
}
```