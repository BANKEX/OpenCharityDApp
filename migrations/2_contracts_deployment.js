const OpenCharityToken = artifacts.require('OpenCharityToken');
const Organization = artifacts.require('Organization');
const CharityEvent = artifacts.require('CharityEvent');
const Tools = artifacts.require('Tools');
const SafeMath = artifacts.require('SafeMath');
const tokenParams = require('../contracts-params').token;
const adminAddresses = require('../contracts-params').admin_addresses;

const PRODUCTION_NETWORK = 'bankexProduction';
const STAGING_NETWORK = 'bankexStaging';


module.exports = async function(deployer, network, accounts) {
	await deployer.deploy(Tools, {overwrite: false});
	await deployer.deploy(SafeMath, {overwrite: false});
	await deployer.link(SafeMath, [OpenCharityToken]);
	await deployer.link(Tools, [Organization]);


	// const openCharityTokenInstance = await OpenCharityToken.deployed();
	// await deployer.deploy(Organization, openCharityTokenInstance.address, adminAddresses, 'Test Organization Name');
	// const OrganizationInstance = await Organization.deployed();
	// await openCharityTokenInstance.setMintAgent(OrganizationInstance.address, true);

	// dev function to deploy new organizations
	// const token = OpenCharityToken.at(openCharityTokenInstance.address);
	let token;
	if(network === STAGING_NETWORK) {
		token = OpenCharityToken.at('0x6a183381d14371b4a228cca37802c09bd166ba9e');
	} else if (network === PRODUCTION_NETWORK) {
		token = OpenCharityToken.at('0x7487a0251a0701a89cade302679b1d01c3d8a44f');
	} else {
		await deployer.deploy(OpenCharityToken, tokenParams.name, tokenParams.symbol, tokenParams.decimals, {overwrite: false});
		token = await OpenCharityToken.deployed();
	}

	await createTestOrganizations(deployer, network, token, adminAddresses);

};


async function createTestOrganizations(deployer, network, tokenInstance, adminAddresses, names) {

	const organizations = [];
	let organization;
	if (!names || names.length === 0) {
		names = [];
		for (let i = 0; i < 3; i++) {
			names.push(generateTestOrganizationName(network, i));
		}
	}

	for (let i = 0; i < names.length; i++) {
		await deployer.deploy(Organization, tokenInstance.address, adminAddresses, names[i]);
		organization = await Organization.deployed();
		organizations.push(web3.toChecksumAddress(organization.address));
		await tokenInstance.setMintAgent(organization.address, true);
	}

	console.log(organizations);

	return organizations;
}

function generateTestOrganizationName(network, i) {
	let date = parseInt(new Date().getDate());
	if (date < 10) {
		date = '0' + date;
	}

	let month = parseInt(new Date().getMonth())+1;
	if (month < 10) {
		month = '0'+month;
	}

	const year = new Date().getFullYear().toString().slice(-2);

	if (network === STAGING_NETWORK ) {
		return `Staging Organization Test ${date}${month}${year}_${i}`;
	} else if (network === PRODUCTION_NETWORK) {
		return `Production Organization Test ${date}${month}${year}_${i}`;
	} else {
		return `Staging Organization Test ${date}${month}${year}_${i}`;
	}
}
