const Organization = artifacts.require('Organization');
const Employee = artifacts.require('Employee');
const Tools = artifacts.require('Tools');
const SafeMath = artifacts.require('SafeMath');
const OpenCharityToken = artifacts.require('OpenCharityToken');
const IncomingDonation = artifacts.require('IncomingDonation');
const tokenParams = require('../contracts-params').token;


contract('Incoming Donation', function(accounts) {
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

    it('should create a new incoming donation contract with specified details', async () => {
        try {
            const transactionDetails = await OrganizationInstance.setIncomingDonation('Test', '200', 'Test note', [0], '0', {
                from: ADMIN_ACCOUNTS[0]
            });

            const donationAddress = transactionDetails.logs[0].args.incomingDonation;
            const IncomingDonationInstance = IncomingDonation.at(donationAddress);

            const donationRealWorldIdentifier = await IncomingDonationInstance.realWorldIdentifier();
            const donationAmount = await OpenCharityTokenInstance.balanceOf(IncomingDonationInstance.address);
            const donationNote = await IncomingDonationInstance.note();
            const donationSourceId = await IncomingDonationInstance.sourceId();

            console.log(`donationSourceId: ${donationSourceId}`);

            assert(donationRealWorldIdentifier === 'Test', 'Wrong realWorldIdentifier');
            assert(donationAmount.toString() === '200', 'Wrong amount');
            assert(donationNote === 'Test note', 'Wrong note');
			assert(donationSourceId.toString() === '0', 'Invalid donation sourceId 2');
        } catch (e) {
            console.log(e);
            assert(false, 'Error during incoming donation creation');
        }


    });
	//
	// it('should throw an error if try to create IncomingDonation with sourceId < 0', async() => {
    	// assert(false, 'Implement test');
	// });
	//
	// it('should throws an error if try to create IncomingDonations with non-existing source id', async() => {
	// 	assert(false, 'Implement test');
	// });

});
