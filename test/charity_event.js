const Organization = artifacts.require('Organization');
const Employee = artifacts.require('Employee');
const Tools = artifacts.require('Tools');
const SafeMath = artifacts.require('SafeMath');
const OpenCharityToken = artifacts.require('OpenCharityToken');
const tokenParams = require('../contracts-params').token;
const CharityEvent = artifacts.require('CharityEvent');

const timeout = ms => new Promise(res => setTimeout(res, ms));

contract('CharityEvent', function(accounts) {
    const ADMIN_ACCOUNTS = [accounts[1], accounts[2]];
    let OrganizationInstance;
    beforeEach(async () => {
    	await timeout(200);
        const SafeMathInstance = await SafeMath.new();
        const ToolsInstance = await Tools.new();
        await Organization.link('Tools', ToolsInstance.address);
        await OpenCharityToken.link('SafeMath', SafeMathInstance.address);

		await timeout(200);
        const OpenCharityTokenInstance = await OpenCharityToken.new('Test', 'TST', tokenParams.decimals);
		await timeout(200);
        OrganizationInstance = await Organization.new(OpenCharityTokenInstance.address, ADMIN_ACCOUNTS, 'Test Organization');
		await timeout(200);
        OpenCharityTokenInstance.setMintAgent(OrganizationInstance.address, true);
		await timeout(200);
    });

    it('should create a new charityEvent with specified details', async () => {
        const name = 'Test Charity Event';
        const target = '100';
        const payed = '0';

        const transactionDetails = await OrganizationInstance.addCharityEvent(name, target, payed, "0", "metahash", {
            from: ADMIN_ACCOUNTS[0]
        });
        const charityEventAddress = transactionDetails.logs[0].args.charityEvent;
        console.log(charityEventAddress);
        const CharityEventInstance = CharityEvent.at(charityEventAddress);

        const charityEvenName = await CharityEventInstance.name();
        const charityEventTarget = (await CharityEventInstance.target()).toString();
        const charityEventPayed = (await CharityEventInstance.payed()).toString();
        const metaHash = (await CharityEventInstance.metaStorageHash()).toString();

        console.log((await CharityEventInstance.metaStorageHash()).toString());

        console.log(`charityEvenName: ${charityEvenName}`);

        assert(charityEvenName === name, 'Wrong charityEvent name');
        assert(charityEventTarget === target, 'Wrong charityEvent target');
        assert(charityEventPayed === payed, 'Wrong charityEvent payed');
    });

	// it('should throw an error if addCharityEvent method called by non-admin', async () => {
	// });


	// it('should throw an error if try to pass not CE address input updateCharityEventDetails methods', async() => {
	//
	// });
	//
	// it('should throw an error if try to set target less than payed', async() => {
	//
	// });

	it('should update charity event', async() => {
		const name = 'Test Charity Event';
		const target = '100';
		const payed = '0';
		const metahash = "metahash";
		const tags = "0";


		const nameUpdated = 'Test Charity Event Updated';
		const targetUpdated = '200';
		const metahashUpdated = 'metahash_updated';
		const tagsUpdated = "12";



		const transactionDetails = await OrganizationInstance.addCharityEvent(name, target, payed, tags, metahash, {
			from: ADMIN_ACCOUNTS[0]
		});

		const charityEventAddress = transactionDetails.logs[0].args.charityEvent;
		const CharityEventInstance = CharityEvent.at(charityEventAddress);

		console.log(`charityEventAddress: ${charityEventAddress}`);

		await OrganizationInstance.updateCharityEventDetails(charityEventAddress, nameUpdated, targetUpdated, tagsUpdated, metahashUpdated, {
			from: ADMIN_ACCOUNTS[0]
		});

		console.log(`CharityEventInstance.target(): ${await CharityEventInstance.target()}`);
		console.log(`await CharityEventInstance.tags(): ${await CharityEventInstance.tags()}`);

		assert(await CharityEventInstance.name() === nameUpdated, 'Name is not updated');
		assert((await CharityEventInstance.target()).toString() === targetUpdated, 'Target is not updated');
		assert(await CharityEventInstance.metaStorageHash() === metahashUpdated, 'Meta storage hash is not updated');
		// assert(await CharityEventInstance.tags() === tagsUpdated, 'Tags are not updated');

	});

	// it('should throw an error if try to updated CE from non-admin account', () => {
	//
	// });

});
