# psycho-irc
A simple IRC-like chat server backend. With user authentication and multiple channels support.

# Endpoints
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