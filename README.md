# psycho-irc-server
A simple IRC-like chat server backend using websockets with user authentication.

# Endpoints
# /users/
Both endpoints should return a json message containing a `token` key that is used to connect to the Websocket server.
## POST `{server}/users/register`
Registers a new user on the server
### Body
```
{
    username: "username",
    password: "password",
    passwordConfirmation: "password"
}
```

## GET `{server}/users/login`
Logs in an existing user to the server
### Body
```
{
    username: "username",
    password: "password"
}
```
## Websocket
# /
Connects a user to the Websocket chat server, the `authtoken` header must be provided with a session token from either `/login` or `/register`.
# Received messages format
Messages are received as a JSON string and it's up to the client to parse and format it, the JSON is structured as follows:
```json
{
    "sender":"Sender's username goes here",
    "type":"Is either 'message' for user sent messages or 'alert' for system alerts like connection status",
    "content":"The message content itself, or the alert text"
}
```
