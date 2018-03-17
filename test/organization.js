const Organization = artifacts.require('Organization');
const Tools = artifacts.require('Tools');
const SafeMath = artifacts.require('SafeMath');
const OpenCharityToken = artifacts.require('OpenCharityToken');
const IncomingDonation = artifacts.require('IncomingDonation');
const tokenParams = require('../contracts-params').token;


contract('Organization', function(accounts) {
	let OrganizationInstance;
	const ADMIN_ACCOUNTS = [accounts[1], accounts[2]];
	let OpenCharityTokenInstance;

	beforeEach(async () => {
		const SafeMathInstance = await SafeMath.new();
		const ToolsInstance = await Tools.new();
		await Organization.link('Tools', ToolsInstance.address);
		await OpenCharityToken.link('SafeMath', SafeMathInstance.address);

		OpenCharityTokenInstance = await OpenCharityToken.new('Test', 'TST', tokenParams.decimals);
		OrganizationInstance = await Organization.new(OpenCharityTokenInstance.address, ADMIN_ACCOUNTS, 'Test Organization');
		OpenCharityTokenInstance.setMintAgent(OrganizationInstance.address, true);
	});

	it('should add new incoming donation source', async () => {
		await OrganizationInstance.addIncomingDonationSource('Source Name', {
			from: ADMIN_ACCOUNTS[0]
		});

		const incomingDonationsSourceIds = (await OrganizationInstance.incomingDonationsSourceIds()).toString();
		const addedSourceName = await OrganizationInstance.incomingDonationsSourceName(0);

		assert(incomingDonationsSourceIds === '1', 'Invalid source id');
		assert(addedSourceName === 'Source Name', 'Invalid source name');
	});

	it('should throws an error if try to add new incoming donation source without admin rights', async() => {
		try {
			await OrganizationInstance.addIncomingDonationSource('Source Name', {
				from: accounts[3]
			});

			assert(false, 'Allow to add new incoming donation source without admin rights')
		} catch(e) {
			const transactionException = e.message.search('Exception while processing transaction: revert') !== -1;
			assert(transactionException, 'Allow to add new incoming donation source without admin rights');
		}
	});


});
