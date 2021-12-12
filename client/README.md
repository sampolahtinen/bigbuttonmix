# BigButton Mix client

The UI for the great app.

test.

### Getting Started

1. clone / fork the repo
2. install dependencies `yarn`

### Developing

`yarn dev` - starts webserver at http://localhost:3000

### Testing

`yarn test --watch` - watch local files
`yarn test --coverage` - collect code test coverage

### Build

`yarn build` - creates a static dist folder

### Enabling Mobile remote debugging:

Be sure that the project is running on your laptop! Both the client and the server. Then:

1. Enable USB Debugging on your Android
2. Enable ADB Over WiFi on your android (might be optional)
3. Connect your phone with USB cable to the laptop
4. On phone, verify access when prompted
5. On your computer go to `chrome://inspect/#devices`
6. Click `Port Forwarding`
7. Choose a port and expose local address, in our case `localhost:3000`
8. Tick the `Enable port forwarding`
9. On your phone you can now navigate to `localhost:PORT_CHOSEN_IN_STEP_7`
