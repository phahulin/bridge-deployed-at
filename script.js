Hrequire('dotenv').config();
const fs = require('fs');
const Web3 = require('web3');
const Web3Utils = require('web3-utils');
const callWithRetries = require('./callWithRetries');
const {
    HOME_RPC_URL,
    FOREIGN_RPC_URL,
    FOREIGN_BRIDGE_ADDRESS,
    HOME_BRIDGE_ADDRESS,
    RETRY_DELAY_MS,
    MAX_RETRIES,
} = process.env;

const homeProvider = new Web3.providers.HttpProvider(HOME_RPC_URL);
const web3Home = new Web3(homeProvider);
const HomeABI = require('../abis/HomeBridge.abi.json');
const homeBridge =  new web3Home.eth.Contract(HomeABI, HOME_BRIDGE_ADDRESS);

const foreignProvider = new Web3.providers.HttpProvider(FOREIGN_RPC_URL);
const web3Foreign = new Web3(foreignProvider);
const ForeignABI = require('../abis/ForeignBridge.abi.json');
const foreignBridge =  new web3Foreign.eth.Contract(ForeignABI, FOREIGN_BRIDGE_ADDRESS);

async function getDeploymentBlocks() {
    try {
        var homeBlock = await callWithRetries({ MAX_RETRIES, RETRY_DELAY_MS })(homeBridge.methods.deployedAtBlock().call);
        console.log('homeBlock = ' + homeBlock);
    }
    catch (ex) {
        console.error('Could not obtain homeBlock: ' + ex);
        return {};
    }

    try {
        var foreignBlock = await callWithRetries({ MAX_RETRIES, RETRY_DELAY_MS })(foreignBridge.methods.deployedAtBlock().call);
        console.log('foreignBlock = ' + foreignBlock);
    }
    catch (ex) {
        console.error('Could not obtain foreignBlock: ' + ex);
        return {};
    }

    return { homeBlock, foreignBlock };
}

async function run() {
    var result = await getDeploymentBlocks();
    if (!result.homeBlock || !result.foreignBlock) process.exit(1);
    console.log(result);
    process.exit(0);
}

run();
