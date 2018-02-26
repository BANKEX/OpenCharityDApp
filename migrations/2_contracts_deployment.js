const OpenCharityToken = artifacts.require('OpenCharityToken');
const Organization = artifacts.require('Organization');
const Employee = artifacts.require('Employee');
const CharityEvent = artifacts.require('CharityEvent');
const Tools = artifacts.require('Tools');
const SafeMath = artifacts.require('SafeMath');
const tokenParams = require('../contracts-params').token;
const adminAddresses = require('../contracts-params').admin_addresses;


module.exports = async function(deployer, network, accounts) {

    await deployer.deploy(Tools, {overwrite: false});
    await deployer.deploy(SafeMath, {overwrite: false});
    await deployer.link(SafeMath, [OpenCharityToken]);
    await deployer.link(Tools, [Organization, Employee, CharityEvent]);
    await deployer.deploy(OpenCharityToken, tokenParams.name, tokenParams.symbol, tokenParams.decimals, {overwrite: false});

    // const openCharityTokenInstance = await OpenCharityToken.deployed();
    // await deployer.deploy(Organization, openCharityTokenInstance.address, adminAddresses, 'Test Organization Name');
    // const OrganizationInstance = await Organization.deployed();
    // await openCharityTokenInstance.setMintAgent(OrganizationInstance.address, true);

    // dev function to deploy new organizations
	const token = OpenCharityToken.at('0x6a183381d14371b4a228cca37802c09bd166ba9e');
	await createTestOrganizations(deployer, token, adminAddresses, ['Staging Organization Test 4', 'Staging Organization Test 5', 'Staging Organization Test 6']);

};


async function createTestOrganizations(deployer, tokenInstance, adminAddresses, names) {

	const organizations = [];
	let organization;

	for(let i = 0; i < names.length; i++) {
		await deployer.deploy(Organization, tokenInstance.address, adminAddresses, names[i]);
		organization = await Organization.deployed();
		organizations.push(organization.address);
		await tokenInstance.setMintAgent(organization.address, true);
	}

	console.log(organizations);
}
