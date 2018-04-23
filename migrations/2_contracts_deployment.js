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
	await deployer.deploy(SafeMath);
	await deployer.link(SafeMath, [OpenCharityToken]);


	// const openCharityTokenInstance = await OpenCharityToken.deployed();
	// await deployer.deploy(Organization, openCharityTokenInstance.address, adminAddresses, 'Test Organization Name');
	// const OrganizationInstance = await Organization.deployed();
	// await openCharityTokenInstance.setMintAgent(OrganizationInstance.address, true);

	// dev function to deploy new organizations
	// const token = OpenCharityToken.at(openCharityTokenInstance.address);
	let token;
	if(network === STAGING_NETWORK) {
		token = OpenCharityToken.at('0xa724a61f4b46d549fd67f5e5d4c441d950b85c43');
	} else if (network === PRODUCTION_NETWORK) {
		token = OpenCharityToken.at('0x1e06133cbb191eecd9a6f3fc54adf56897fda110');
	} else {
		await deployer.deploy(OpenCharityToken, tokenParams.name, tokenParams.symbol, tokenParams.decimals);
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
