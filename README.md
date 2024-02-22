## Node.js Redis Pub/Sub with Passport.js Authentication

This Node.js project demonstrates a simple implementation of Redis Pub/Sub pattern in conjunction with Passport.js for authentication. The project utilizes event-driven architecture to handle authentication requests and responses asynchronously.

### System Flow:

1. **Frontend Setup**:\
The frontend establishes a connection to the server using EventSource.
It listens for authentication events from the server.
2. **Authentication Request**:\
When a user initiates authentication, the frontend sends a request to the authentication endpoint (oauth/google/{token}).
3. **Authentication Endpoint**:\
Upon receiving an authentication request, the server-side authentication endpoint subscribes to an event channel based on the token received.
4. **Passport.js Authentication**:\
The authentication endpoint utilizes Passport.js to authenticate the user.
5. **Authentication Result**:\
Once authentication is completed, Passport.js communicates the authentication result to the backend via callback enpoint.
6. **Publish Authentication Result**:\
The backend publishes the authentication result to the corresponding event channel associated with the token provided earlier.
7. **Frontend Response**:\
The frontend, listening for authentication events, receives the authentication result from the server via the subscribed event channel.
8. **Close event**:\
Upon receiving authentication result, the frontend must close the event source connection to tell the backend to unsubscribe to the event channel