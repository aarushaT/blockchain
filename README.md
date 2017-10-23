# To start test env

## Starting for the first time
1. cd into an empty directory
2. Run `truffle init webpack`

## Building and the frontend
1. Start testrpc in a command window
2. In a separate command window, navigate to webpack project directory and run `truffle compile`, then run `truffle migrate` to deploy the contracts onto your network of choice (default "development").
3. Then run `npm run dev` to build the app and serve it on http://localhost:8080.

## Front-end file
Located in webpack/app/javascripts/

# blockchain