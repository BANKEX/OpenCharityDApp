const OpenCharityToken = artifacts.require('OpenCharityToken');
const Organization = artifacts.require('Organization');
const Employee = artifacts.require('Employee');
const CharityEvent = artifacts.require('CharityEvent');
const Tools = artifacts.require('Tools');
const SafeMath = artifacts.require('SafeMath');
const tokenParams = require('../contracts-params').token;


module.exports = async function(deployer, network, accounts) {

    await deployer.deploy(Tools, {overwrite: false});
    await deployer.deploy(SafeMath, {overwrite: false});
    await deployer.link(SafeMath, [OpenCharityToken]);
    await deployer.link(Tools, [Organization, Employee, CharityEvent]);
    await deployer.deploy(OpenCharityToken, tokenParams.name, tokenParams.symbol, tokenParams.decimals, {overwrite: false});

    const openCharityTokenInstance = await OpenCharityToken.deployed();
    await deployer.deploy(Organization, openCharityTokenInstance.address, [accounts[0], accounts[1]], 'Test Organization Name');
    const OrganizationInstance = await Organization.deployed();
    await openCharityTokenInstance.setMintAgent(OrganizationInstance.address, true);

};
