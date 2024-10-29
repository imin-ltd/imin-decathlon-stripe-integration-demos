# imin-decathlon-stripe-integration-demos

Code used to proof-of-concept test the imin x Decathlon Stripe integration.

The report of the proof-of-concept is here: https://docs.google.com/document/d/1BT4-zLkBjDfliqi4t1mqEqQ3djL0Rvjbv5u61LaCrFE/edit?tab=t.0#heading=h.r2qauhezxkwx.

## Set-up

```sh
nvm use # Pre-requisite: Have NVM
npm install
```

## Running

```sh
npm run build
npm run start-1 # or start-2, start-3, start-4
```

## Running (dev commands)

- Build and rebuild on file change: `npm run build:watch`
- Start and restart on build change: `npm run start-1:watch` (or start-2, start-3, start-4)

## Testing

```sh
npm test
```

This checks for errors with ESLint, Prettier and TypeScript Compiler.
