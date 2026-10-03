Network Working Group                                        Epitech Project
Request for Comments: XXXX                                   G-NWP-400-COT-4-1
Category: Informational                                      April 2026

                  MyTeams Protocol (MTP)
          A Collaborative Communication Protocol
          =========================================

Status of This Memo

   This document specifies a protocol for a collaborative communication
   system. This document is produced for the Epitech G-NWP-400 module.

Abstract

   This memo describes the MyTeams Protocol (MTP), a binary-framed,
   TCP-oriented application-layer protocol for managing collaborative
   communications. MTP allows clients to authenticate, manage teams,
   channels, threads, comments, and personal messages through a simple
   packet/response model.

Table of Contents

   1.  Introduction
   2.  Terminology
   3.  Connection Model
   4.  Protocol Overview
   5.  Packet Format
   6.  Response Codes
   7.  Commands
       7.1.  Authentication Commands
       7.2.  User Commands
       7.3.  Team Commands
       7.4.  Channel Commands
       7.5.  Thread Commands
       7.6.  Comment Commands
       7.7.  Messaging Commands
       7.8.  Context Commands
       7.9.  Utility Commands
   8.  Data Payloads
   9.  State Machine
   10. Security Considerations
   11. Example Sessions

------------------------------------------------------------------------

1. Introduction

   MyTeams Protocol (MTP) is a stateful, binary-framed protocol that
   operates over a reliable transport layer (TCP). It is designed to
   support a multi-user collaborative environment inspired by Microsoft
   Teams. Clients connect to the server, authenticate by providing a
   username, and then interact with teams, channels, threads, and
   personal messages.

   The design uses fixed-size packet headers with typed command codes
   and response codes, combined with variable-length payloads serialized
   as JSON strings.

2. Terminology

   The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHOULD",
   "MAY" are to be interpreted as described in RFC 2119.

   Server        - The myteams_server binary listening on a TCP port.
   Client        - The myteams_cli binary connecting to the server.
   User          - A registered entity identified by a UUID and username.
   Team          - A collaborative group identified by a UUID.
   Channel       - A sub-space inside a team, identified by a UUID.
   Thread        - A discussion topic inside a channel, identified by UUID.
   Comment       - A reply to a thread, part of the thread discussion.
   Context       - The current team/channel/thread selected by the client.
   UUID          - A 36-character string (RFC 4122 format).
   Packet        - A binary frame sent over TCP (header + payload).

3. Connection Model

   The server MUST listen on a TCP port provided at startup:

       ./myteams_server <port>

   Upon a successful TCP connection, the server sends a greeting packet
   with code 201:

       201 Connected to MyTeams server.

   Each client connection is stateful. The server maintains:
     - The logged-in user UUID
     - The current context (team_uuid / channel_uuid / thread_uuid)
     - The subscription list of the user

   The server MUST handle multiple simultaneous clients using poll(2).
   The use of fork(2) or threads is PROHIBITED.
   The server MUST save its state on shutdown (SIGINT) and restore it
   on startup if a save file exists.

4. Protocol Overview

   MTP uses a binary packet format. Each packet consists of a fixed-size
   header followed by a variable-length JSON payload.

   The client sends command packets to the server. The server responds
   with response packets. The server MAY also push unsolicited event
   packets (7xx codes) to relevant connected clients.

   Payload field constraints:
     MAX_NAME_LENGTH        = 32
     MAX_DESCRIPTION_LENGTH = 255
     MAX_BODY_LENGTH        = 512
     UUID_LENGTH            = 36

5. Packet Format

   All packets share the following binary header (network byte order):

       +--------+--------+------------------+
       | type   | length | payload          |
       | 1 byte | 4 bytes| <length> bytes   |
       +--------+--------+------------------+

   Field descriptions:
     type        - Command/response identifier (uint8_t). See section 7.
     length      - Length of the JSON payload in bytes (uint32_t).
     payload     - UTF-8 encoded JSON string of exactly length bytes.

   The payload immediately follows the header. An empty payload has
   length = 0.

   Example packet structure (C):

       typedef struct s_packet {
           uint8_t  type;
           uint32_t length;
           char     payload[];   /* flexible array, length bytes */
       } t_packet;

   All multi-field payloads are JSON objects or arrays. Single-value
   payloads (e.g. a UUID string) are plain JSON strings.

6. Response Codes

   Response codes are carried in the `type` field of the packet header.

   2xx  Positive Completion
   -------------------------------------------------------
   200  OK - Command completed successfully.
   201  Connected - Service ready.
   202  Logged in - User authenticated.
   203  Logged out - User disconnected.
   210  Data follows - Response contains a JSON array payload.
   212  User info.
   213  Team info.
   214  Channel info.
   215  Thread info.
   216  Comment posted.
   217  Message sent.
   218  Subscribed to team.
   219  Unsubscribed from team.
   220  Context updated.

   4xx  Transient Negative Completion (client error)
   -------------------------------------------------------
   400  Bad request - Missing or malformed argument.
   401  Not logged in - Authentication required.
   403  Forbidden - Insufficient permissions.
   404  Not found - Resource does not exist.
   409  Conflict - Resource already exists.
   413  Argument too long - Exceeds maximum length.

   5xx  Permanent Negative Completion (server error)
   -------------------------------------------------------
   500  Internal server error.
   501  Unknown command.

   Event Push Codes (Server -> Client, unsolicited)
   -------------------------------------------------------
   700  Event: A user logged in.
   701  Event: A user logged out.
   702  Event: A new team was created.
   703  Event: A new channel was created.
   704  Event: A new thread was created.
   705  Event: A new comment was posted.
   706  Event: A new personal message received.
   707  Event: A user subscribed to a team you belong to.
   708  Event: A user unsubscribed from a team you belong to.

7. Commands

   Command identifiers (type field):

       LOGIN          = 0x01
       LOGOUT         = 0x02
       USERS          = 0x03
       USER           = 0x04
       TEAMS          = 0x05
       TEAM           = 0x06
       CREATE_TEAM    = 0x07
       SUBSCRIBE      = 0x08
       UNSUBSCRIBE    = 0x09
       SUBSCRIBED     = 0x0A
       CHANNELS       = 0x0B
       CHANNEL        = 0x0C
       CREATE_CHANNEL = 0x0D
       THREADS        = 0x0E
       THREAD         = 0x0F
       CREATE_THREAD  = 0x10
       COMMENTS       = 0x11
       CREATE_COMMENT = 0x12
       SEND           = 0x13
       MESSAGES       = 0x14
       USE            = 0x15
       CREATE         = 0x16
       LIST           = 0x17
       INFO           = 0x18
       HELP           = 0x19
       QUIT           = 0x1A

7.1. Authentication Commands

   LOGIN
   -----
   type:    LOGIN (0x01)
   Payload: { "username": "<string, max 32>" }
   Auth:    Not required.
   Response:
     202  { "uuid": "<user_uuid>" }
     409  {} (Username already in use on another active connection.)

   Description:
     Registers the username on the server. If the username already
     exists, the user is reconnected with its existing UUID. If it is
     a new username, a new UUID is generated and assigned.
     Logged-in users receive unsolicited event notifications (7xx).

   LOGOUT
   ------
   type:    LOGOUT (0x02)
   Payload: (empty)
   Auth:    Required.
   Response:
     203  {}
     401  {}

   Description:
     Disconnects the user from the server. The TCP connection is
     subsequently closed by the server.

7.2. User Commands

   USERS
   -----
   cmd:     CMD_USERS (0x03)
   Payload: (empty)
   Auth:    Required.
   Response:
     210  [ { "uuid":"<uuid>", "name":"<name>", "is_connected":<0|1> }, ... ]
     401  {}

   USER
   ----
   cmd:     CMD_USER (0x04)
   Payload: { "user_uuid": "<uuid>" }
   Auth:    Required.
   Response:
     212  { "uuid":"<uuid>", "name":"<name>", "is_connected":<0|1> }
     404  {}
     401  {}

7.3. Team Commands

   TEAMS
   -----
   cmd:     CMD_TEAMS (0x05)
   Payload: (empty)
   Auth:    Required.
   Response:
     210  [ { "uuid":"<uuid>", "name":"<name>", "description":"<desc>" }, ... ]

   TEAM
   ----
   cmd:     CMD_TEAM (0x06)
   Payload: { "team_uuid": "<uuid>" }
   Auth:    Required.
   Response:
     213  { "uuid":"<uuid>", "name":"<name>", "description":"<desc>", "creator":"<uuid>" }
     404  {}

   CREATE_TEAM
   -----------
   cmd:     CMD_CREATE_TEAM (0x07)
   Payload: { "name": "<string, max 32>", "description": "<string, max 255>" }
   Auth:    Required.
   Response:
     200  { "uuid": "<new_team_uuid>" }
     409  {}
     413  {}

   SUBSCRIBE
   ---------
   cmd:     CMD_SUBSCRIBE (0x08)
   Payload: { "team_uuid": "<uuid>" }
   Auth:    Required.
   Response:
     218  { "team_uuid": "<uuid>" }
     404  {}
     409  {}

   UNSUBSCRIBE
   -----------
   cmd:     CMD_UNSUBSCRIBE (0x09)
   Payload: { "team_uuid": "<uuid>" }
   Auth:    Required.
   Response:
     219  { "team_uuid": "<uuid>" }
     404  {}
     403  {}

   SUBSCRIBED
   ----------
   cmd:     CMD_SUBSCRIBED (0x0A)
   Payload: {} or { "team_uuid": "<uuid>" }
   Auth:    Required.
   Response (no team_uuid):
     210  [ { "uuid":"<uuid>", "name":"<name>", "description":"<desc>" }, ... ]
   Response (with team_uuid):
     210  [ { "uuid":"<uuid>", "name":"<name>" }, ... ]

7.4. Channel Commands

   CHANNELS
   --------
   cmd:     CMD_CHANNELS (0x0B)
   Payload: { "team_uuid": "<uuid>" }
   Auth:    Required (must be subscribed to team).
   Response:
     210  [ { "uuid":"<uuid>", "name":"<name>", "description":"<desc>" }, ... ]
     403  {}
     404  {}

   CHANNEL
   -------
   cmd:     CMD_CHANNEL (0x0C)
   Payload: { "channel_uuid": "<uuid>" }
   Auth:    Required.
   Response:
     214  { "uuid":"<uuid>", "name":"<name>", "description":"<desc>" }
     404  {}

   CREATE_CHANNEL
   --------------
   cmd:     CMD_CREATE_CHANNEL (0x0D)
   Payload: { "team_uuid":"<uuid>", "name":"<string, max 32>",
              "description":"<string, max 255>" }
   Auth:    Required (must be subscribed to team).
   Response:
     200  { "uuid": "<new_channel_uuid>" }
     403  {}
     404  {}
     409  {}
     413  {}

7.5. Thread Commands

   THREADS
   -------
   cmd:     CMD_THREADS (0x0E)
   Payload: { "team_uuid": "<uuid>", "channel_uuid": "<uuid>" }
   Auth:    Required (must be subscribed to team).
   Response:
     210  [ { "uuid":"<uuid>", "title":"<title>", "body":"<body>",
              "timestamp":<unix_ts>, "creator":"<uuid>" }, ... ]
     403  {}
     404  {}

   THREAD
   ------
   cmd:     CMD_THREAD (0x0F)
   Payload: { "thread_uuid": "<uuid>" }
   Auth:    Required.
   Response:
     215  { "uuid":"<uuid>", "title":"<title>", "body":"<body>",
            "timestamp":<unix_ts>, "creator":"<uuid>" }
     404  {}

   CREATE_THREAD
   -------------
   cmd:     CMD_CREATE_THREAD (0x10)
   Payload: { "team_uuid":"<uuid>", "channel_uuid":"<uuid>",
              "title":"<string, max 32>", "body":"<string, max 512>" }
   Auth:    Required (must be subscribed to team).
   Response:
     200  { "uuid": "<new_thread_uuid>" }
     403  {}
     404  {}
     413  {}

7.6. Comment Commands

   COMMENTS
   --------
   cmd:     CMD_COMMENTS (0x11)
   Payload: { "team_uuid":"<uuid>", "channel_uuid":"<uuid>",
              "thread_uuid":"<uuid>" }
   Auth:    Required (must be subscribed to team).
   Response:
     210  [ { "body":"<body>", "timestamp":<ts>, "creator":"<uuid>" }, ... ]
     403  {}
     404  {}

   CREATE_COMMENT
   --------------
   cmd:     CMD_CREATE_COMMENT (0x12)
   Payload: { "team_uuid":"<uuid>", "channel_uuid":"<uuid>",
              "thread_uuid":"<uuid>", "body":"<string, max 512>" }
   Auth:    Required (must be subscribed to team).
   Response:
     216  {}
     403  {}
     404  {}
     413  {}

7.7. Messaging Commands

   SEND
   ----
   cmd:     CMD_SEND (0x13)
   Payload: { "user_uuid": "<uuid>", "body": "<string, max 512>" }
   Auth:    Required.
   Response:
     217  {}
     404  {}
     413  {}

   MESSAGES
   --------
   cmd:     CMD_MESSAGES (0x14)
   Payload: { "user_uuid": "<uuid>" }
   Auth:    Required.
   Response:
     210  [ { "sender":"<uuid>", "body":"<body>", "timestamp":<ts> }, ... ]
     404  {}

7.8. Context Commands

   USE
   ---
   cmd:     CMD_USE (0x15)
   Payload: {}
             { "team_uuid": "<uuid>" }
             { "team_uuid": "<uuid>", "channel_uuid": "<uuid>" }
             { "team_uuid": "<uuid>", "channel_uuid": "<uuid>",
               "thread_uuid": "<uuid>" }
   Auth:    Required.
   Response:
     220  { "team_uuid":"<uuid|null>", "channel_uuid":"<uuid|null>",
            "thread_uuid":"<uuid|null>" }
     404  {}
     403  {}

   Description:
     Sets the current context for context-sensitive commands
     (CREATE, LIST, INFO). An empty payload resets the context.

   CREATE (context-sensitive)
   --------------------------
   cmd:     CMD_CREATE (0x16)
   Auth:    Required.
   Description:
     Delegates to CREATE_TEAM, CREATE_CHANNEL, CREATE_THREAD, or
     CREATE_COMMENT depending on current context (see USE).

   LIST (context-sensitive)
   ------------------------
   cmd:     CMD_LIST (0x17)
   Auth:    Required.
   Description:
     Delegates to TEAMS, CHANNELS, THREADS, or COMMENTS depending
     on current context (see USE).

   INFO (context-sensitive)
   ------------------------
   cmd:     CMD_INFO (0x18)
   Auth:    Required.
   Description:
     With no context   : displays logged-in user info.
     With team context : displays team info.
     With channel ctx  : displays channel info.
     With thread ctx   : displays thread info.

7.9. Utility Commands

   HELP
   ----
   cmd:     CMD_HELP (0x19)
   Payload: (empty)
   Auth:    Not required.
   Response:
     200  { "message": "Available commands: LOGIN, LOGOUT, USERS, ..." }

   QUIT
   ----
   cmd:     CMD_QUIT (0x1A)
   Payload: (empty)
   Auth:    Not required.
   Response:
     203  {}
     [Connection closed by server]

8. Data Payloads

   All payloads are UTF-8 encoded JSON. Field names and types:

   User object:
     { "uuid":         "<36-char UUID>",
       "name":         "<string, max 32>",
       "is_connected": <0 | 1> }

   Team object:
     { "uuid":        "<36-char UUID>",
       "name":        "<string, max 32>",
       "description": "<string, max 255>",
       "creator":     "<user_uuid>" }

   Channel object:
     { "uuid":        "<36-char UUID>",
       "name":        "<string, max 32>",
       "description": "<string, max 255>" }

   Thread object:
     { "uuid":      "<36-char UUID>",
       "title":     "<string, max 32>",
       "body":      "<string, max 512>",
       "timestamp": <unix timestamp>,
       "creator":   "<user_uuid>" }

   Comment object:
     { "body":      "<string, max 512>",
       "timestamp": <unix timestamp>,
       "creator":   "<user_uuid>" }

   Message object:
     { "sender":    "<user_uuid>",
       "body":      "<string, max 512>",
       "timestamp": <unix timestamp> }

   Event payload (7xx):
     { "uuid": "<uuid>", "name": "<name>", ... }
     (fields vary per event code, see section 6)

9. State Machine

   Each client connection moves through the following states:

   [CONNECTED] --LOGIN--> [AUTHENTICATED] --LOGOUT--> [DISCONNECTED]
                                |
                           USE {team_uuid}
                                |
                         [TEAM CONTEXT SET]
                                |
                    USE {team_uuid, channel_uuid}
                                |
                       [CHANNEL CONTEXT SET]
                                |
             USE {team_uuid, channel_uuid, thread_uuid}
                                |
                        [THREAD CONTEXT SET]
                                |
                      USE {} --> back to [AUTHENTICATED]

10. Security Considerations

   - A client in state [CONNECTED] (not authenticated) MUST NOT be able
     to execute any command except LOGIN, HELP, and QUIT.
   - A client NOT subscribed to a team MUST NOT create threads or
     channels in that team, nor receive events from it.
   - UUIDs MUST be generated server-side using libuuid (man 3 uuid).
   - The server MUST save its state on SIGINT and restore it on startup.
   - No password authentication is required by this version of MTP.

11. Example Sessions

   Example 1: Login, create a team, subscribe, and post a thread.
   --------------------------------------------------------------

   S->C: [type=201] "Connected to MyTeams server."

   C->S: [type=LOGIN]  { "username": "alice" }
   S->C: [type=202]   { "uuid": "550e8400-e29b-41d4-a716-446655440000" }

   C->S: [type=CREATE_TEAM] { "name": "DevTeam", "description": "Our dev team" }
   S->C: [type=200]        { "uuid": "660e8400-e29b-41d4-a716-556655440001" }

   C->S: [type=SUBSCRIBE] { "team_uuid": "660e8400-e29b-41d4-a716-556655440001" }
   S->C: [type=218]      { "team_uuid": "660e8400-e29b-41d4-a716-556655440001" }

   C->S: [type=USE]  { "team_uuid": "660e8400-e29b-41d4-a716-556655440001" }
   S->C: [type=220] { "team_uuid": "660e8400-...", "channel_uuid": null,
                      "thread_uuid": null }

   C->S: [type=CREATE] { "name": "general", "description": "General discussion" }
   S->C: [type=200]   { "uuid": "770e8400-e29b-41d4-a716-116655440002" }

   C->S: [type=USE]  { "team_uuid": "660e8400-...",
                      "channel_uuid": "770e8400-..." }
   S->C: [type=220] { "team_uuid": "660e8400-...", "channel_uuid": "770e8400-...",
                      "thread_uuid": null }

   C->S: [type=CREATE] { "title": "Hello everyone",
                        "body": "This is the first post!" }
   S->C: [type=200]   { "uuid": "880e8400-e29b-41d4-a716-226655440003" }

   C->S: [type=LOGOUT] {}
   S->C: [type=203]   {}
   [Connection closed]

   Example 2: Personal messaging.
   ------------------------------

   S->C: [type=201] "Connected to MyTeams server."

   C->S: [type=LOGIN] { "username": "bob" }
   S->C: [type=202]  { "uuid": "991e8400-e29b-41d4-a716-336655440004" }

   C->S: [type=SEND]  { "user_uuid": "550e8400-e29b-41d4-a716-446655440000",
                       "body": "Hey Alice!" }
   S->C: [type=217]  {}

   C->S: [type=MESSAGES] { "user_uuid": "550e8400-e29b-41d4-a716-446655440000" }
   S->C: [type=210]     [ { "sender":    "991e8400-...",
                             "body":      "Hey Alice!",
                             "timestamp": 1712600000 } ]

   Example 3: Unsolicited event push.
   -----------------------------------

   While alice is connected, bob logs in:

   S->A: [type=700] { "uuid": "991e8400-...", "name": "bob" }

   While alice is in a subscribed team, carol creates a new thread:

   S->A: [type=704] { "uuid": "...", "title": "New idea",
                      "channel_uuid": "...", "creator": "<carol_uuid>" }

------------------------------------------------------------------------

Authors' Note

   This RFC was written as part of the Epitech G-NWP-400 curriculum.
   The MyTeams Protocol (MTP) is not an IETF standard.

------------------------------------------------------------------------