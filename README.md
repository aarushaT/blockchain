# To start test env

## Starting for the first time

### From scratch
1. cd into an empty directory
2. Run `truffle init webpack`

### If using repository
1. clone repository into folder `git clone -o origin https://github.com/aarushaT/blockchain.git`
2. Run `cd blockchain/webpack`
3. Run `npm install` to install required node modules 

#### **Always remember to run npm install when you checkout from repository**

## Building and the frontend
1. Start `testrpc` in a command window
2. In a separate command window, navigate to webpack project directory and run `truffle compile`; then run `truffle migrate` to deploy the contracts onto your network of choice (default "development").
3. Then run `npm run dev` to build the app and serve it on http://localhost:8080.

## Front-end file
Located in webpack/app/javascripts/

# Blockchain