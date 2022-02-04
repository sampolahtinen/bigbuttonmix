# Big Button Mix

Big Button Mix is a PWA that helps you break free from modern music recommendation algorithms
by randomly giving you a mix tape of an artist who is playing nearby you next weekend.

## Run in Development

1. Install dependencies

```
yarn
```

2. Start redis. Redis is used for caching of scraping results.

```
yarn start:redis
```

3. Start API server

```
yarn dev:api
```

4. Start client

```
yarn dev:client
```

5. Visit the client at http://localhost:5000

## Building the project

1. Simply run:

```
yarn build:all
```
