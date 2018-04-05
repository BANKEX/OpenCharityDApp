const Organization = artifacts.require('Organization');
const Employee = artifacts.require('Employee');
const Tools = artifacts.require('Tools');
const SafeMath = artifacts.require('SafeMath');
const OpenCharityToken = artifacts.require('OpenCharityToken');
const CharityEvent = artifacts.require('CharityEvent');
const IncomingDonation = artifacts.require('IncomingDonation');
const tokenParams = require('../contracts-params').token;


contract('Organization', function(accounts) {
    const ADMIN_ACCOUNTS = [accounts[1], accounts[2]];
    const INCOMING_DONATION_AMOUNT = 200;

    let OrganizationInstance;
    let IncomingDonationInstance;
    let CharityEventInstance;
    let OpenCharityTokenInstance;

    beforeEach(async () => {
        const SafeMathInstance = await SafeMath.new();
        const ToolsInstance = await Tools.new();
        await Organization.link('Tools', ToolsInstance.address);
        await OpenCharityToken.link('SafeMath', SafeMathInstance.address);

        OpenCharityTokenInstance = await OpenCharityToken.new('Test', 'TST', tokenParams.decimals);
        OrganizationInstance = await Organization.new(OpenCharityTokenInstance.address, ADMIN_ACCOUNTS, 'Test Organization');
        await OpenCharityTokenInstance.setMintAgent(OrganizationInstance.address, true);

        await OrganizationInstance.setIncomingDonation('Test Incoming Donation', INCOMING_DONATION_AMOUNT, 'Test note', '0x3f', '0', {
            from: ADMIN_ACCOUNTS[0]
        });

        await OrganizationInstance.addCharityEvent('Test Charity Event', INCOMING_DONATION_AMOUNT+200, '0', '0x01', 'metahash', {
            from: ADMIN_ACCOUNTS[0]
        });


        CharityEventInstance = CharityEvent.at(await getLastCharityEventAddress(OrganizationInstance));
        IncomingDonationInstance = IncomingDonation.at(await getLastIncomingDonationAddress(OrganizationInstance));

    });

    it('should move tokens from donation to charity event contract', async () => {
        try {
        	const amountToMove = INCOMING_DONATION_AMOUNT - INCOMING_DONATION_AMOUNT/2;
            await OrganizationInstance.moveDonationFundsToCharityEvent(IncomingDonationInstance.address, CharityEventInstance.address, amountToMove, {
                from: ADMIN_ACCOUNTS[0]
            });

            const incomingDonationBalance = await OpenCharityTokenInstance.balanceOf(IncomingDonationInstance.address);
            const eventBalance = await OpenCharityTokenInstance.balanceOf(CharityEventInstance.address);

            assert(eventBalance.toNumber() === amountToMove, 'Tokens haven\'t move to charity event');
            assert(incomingDonationBalance.toNumber() === amountToMove, 'Tokens are still on incomingDonation balance');

        } catch (e) {
            console.log(e);
        }
    });

    it('should not move tokens if charity event and incoming donation has no tags matches', async () => {

        await OrganizationInstance.addCharityEvent('Test Charity Event With Unmatched Tags', INCOMING_DONATION_AMOUNT+200, '0', '0xC0', 'metahash', {
            from: ADMIN_ACCOUNTS[0]
        });

        const UnmatchedCharityEvent = CharityEvent.at(await getLastCharityEventAddress(OrganizationInstance));


        try {
            await OrganizationInstance.moveDonationFundsToCharityEvent(IncomingDonationInstance.address, UnmatchedCharityEvent.address, INCOMING_DONATION_AMOUNT, {
                from: ADMIN_ACCOUNTS[0]
            });

            assert(false, 'Move funds to charity event with unmatched tags');
        } catch (e) {
            const transactionException = e.message.search('Exception while processing transaction: revert') !== -1;
            assert(transactionException, 'Move funds to charity event with unmatched tags');
        }
    });

    it('should move funds from ID without tags to any CE', async() => {
		try {
			const amountToMove = INCOMING_DONATION_AMOUNT - INCOMING_DONATION_AMOUNT/2;

			await OrganizationInstance.setIncomingDonation('Test Incoming Donation', INCOMING_DONATION_AMOUNT, 'Test note', '0x00', '0', {
				from: ADMIN_ACCOUNTS[0]
			});


			await OrganizationInstance.addCharityEvent('Test Charity Event', INCOMING_DONATION_AMOUNT+20000, '0', '0x00', 'metahash', {
				from: ADMIN_ACCOUNTS[0]
			});

			const charityEventInstance = CharityEvent.at(await getLastCharityEventAddress(OrganizationInstance));
			const incomingDonationInstance = IncomingDonation.at(await getLastIncomingDonationAddress(OrganizationInstance));


			await OrganizationInstance.moveDonationFundsToCharityEvent(incomingDonationInstance.address, charityEventInstance.address, amountToMove, {
				from: ADMIN_ACCOUNTS[0]
			});

			let incomingDonationBalance = await OpenCharityTokenInstance.balanceOf(incomingDonationInstance.address);
			let eventBalance = await OpenCharityTokenInstance.balanceOf(charityEventInstance.address);

			assert(eventBalance.toNumber() === amountToMove, 'Tokens haven\'t move to charity event');
			assert(incomingDonationBalance.toNumber() === amountToMove, 'Tokens are still on incomingDonation balance');


			await OrganizationInstance.moveDonationFundsToCharityEvent(IncomingDonationInstance.address, charityEventInstance.address, amountToMove, {
				from: ADMIN_ACCOUNTS[0]
			});

			incomingDonationBalance = await OpenCharityTokenInstance.balanceOf(IncomingDonationInstance.address);
			eventBalance = await OpenCharityTokenInstance.balanceOf(charityEventInstance.address);

			assert(eventBalance.toNumber() === amountToMove*2, 'Tokens haven\'t move to charity event');
			assert(incomingDonationBalance.toNumber() === amountToMove, 'Tokens are still on incomingDonation balance');
		} catch (e) {
			assert(false, 'Have not moved funds to CE without tags');
		}
	});

	it('should move funds to CE without tags from any ID', async() => {
		try {
			const amountToMove = INCOMING_DONATION_AMOUNT - INCOMING_DONATION_AMOUNT/2;

			await OrganizationInstance.setIncomingDonation('Test Incoming Donation', INCOMING_DONATION_AMOUNT, 'Test note', '0x00', '0', {
				from: ADMIN_ACCOUNTS[0]
			});
			const incomingDonationInstance = IncomingDonation.at(await getLastIncomingDonationAddress(OrganizationInstance));


			await OrganizationInstance.moveDonationFundsToCharityEvent(incomingDonationInstance.address, CharityEventInstance.address, amountToMove, {
				from: ADMIN_ACCOUNTS[0]
			});

			const incomingDonationBalance = await OpenCharityTokenInstance.balanceOf(incomingDonationInstance.address);
			const eventBalance = await OpenCharityTokenInstance.balanceOf(CharityEventInstance.address);

			assert(eventBalance.toNumber() === amountToMove, 'Tokens haven\'t move to charity event');
			assert(incomingDonationBalance.toNumber() === amountToMove, 'Tokens are still on incomingDonation balance');

		} catch (e) {
			console.log(e);
		}
	});

	// it('should throws an error if try to move tokens directly via IncomingDonation contract instead of using Organization contract', async () => {
    	// assert(false, 'Implement test');
	// });


});


async function getLastCharityEventAddress(organizationInstance) {
    let count = (await organizationInstance.charityEventCount()).toNumber();
    return organizationInstance.charityEventIndex(--count);
}

async function getLastIncomingDonationAddress(organizationInstance) {
    let count = (await organizationInstance.incomingDonationCount()).toNumber();
    return organizationInstance.incomingDonationIndex(--count);
}


