const Organization = artifacts.require('Organization');
const Employee = artifacts.require('Employee');
const Tools = artifacts.require('Tools');
const SafeMath = artifacts.require('SafeMath');
const OpenCharityToken = artifacts.require('OpenCharityToken');
const tokenParams = require('../contracts-params').token;
const CharityEvent = artifacts.require('CharityEvent');


contract('Charity Event', function(accounts) {
    const ADMIN_ACCOUNTS = [accounts[1], accounts[2]];
    let OrganizationInstance;
    beforeEach(async () => {
        const SafeMathInstance = await SafeMath.new();
        const ToolsInstance = await Tools.new();
        await Organization.link('Tools', ToolsInstance.address);
        await OpenCharityToken.link('SafeMath', SafeMathInstance.address);

        const OpenCharityTokenInstance = await OpenCharityToken.new('Test', 'TST', tokenParams.decimals);
        OrganizationInstance = await Organization.new(OpenCharityTokenInstance.address, ADMIN_ACCOUNTS, 'Test Organization');
        OpenCharityTokenInstance.setMintAgent(OrganizationInstance.address, true);
    });

    it('should create a new charityEvent with specified details', async () => {
        const name = 'Test Charity Event';
        const target = '100';
        const payed = '0';
        const tags = [0, 1, 2];
        const metaHash = 'metaHash';

        const transactionDetails = await OrganizationInstance.addCharityEvent(name, target, payed, tags, metaHash, {
            from: ADMIN_ACCOUNTS[0]
        });
        const charityEventAddress = transactionDetails.logs[0].args.charityEvent;
        // console.log(charityEventAddress);
        const CharityEventInstance = CharityEvent.at(charityEventAddress);

        const charityEvenName = await CharityEventInstance.name();
        const charityEventTarget = (await CharityEventInstance.target()).toString();
        const charityEventPayed = (await CharityEventInstance.payed()).toString();
        const charityEventMetaHash = (await CharityEventInstance.metaStorageHash()).toString();
        const charityEventTags = await getCharityEventTags(CharityEventInstance);


		console.log(`charityEventTags: ${charityEventTags}`);


        // console.log(metaHash);

        // await CharityEventInstance.updateMetaStorageHash('updated');

        // console.log((await CharityEventInstance.metaStorageHash()).toString());

        assert(charityEvenName === name, 'Wrong charityEvent name');
        assert(charityEventTarget === target, 'Wrong charityEvent target');
        assert(charityEventPayed === payed, 'Wrong charityEvent payed');
        assert(charityEventMetaHash === metaHash, 'Wrong metaHash');
        assert(isEqualTags(tags, charityEventTags), 'Wrong tags');
    });


    it('should throw an error if addCharityEvent method called by non-admin', async () => {
        try {
			const name = 'Test Charity Event';
			const target = '100';
			const payed = '0';
			const tags = [0, 1, 2];
			const metaHash = 'metaHash';

			await OrganizationInstance.addCharityEvent(name, target, payed, tags, metaHash, {
				from: accounts[0]
			});

            assert(false, 'Allow to create new CE without admin rights 1 ');
        } catch (exception) {
            const transactionException = exception.message.search('Exception while processing transaction: revert') !== -1;
            assert(transactionException, 'Allow to create new CE without admin rights 2');
        }
    });

    it('should update existing charity event', async() => {
		const name = 'Test Charity Event';
		const target = '100';
		const payed = '0';
		const tags = [0, 1, 2];
		const metaHash = 'metaHash';

		const transactionDetails = await OrganizationInstance.addCharityEvent(name, target, payed, tags, metaHash, {
			from: ADMIN_ACCOUNTS[0]
		});
		const charityEventAddress = transactionDetails.logs[0].args.charityEvent;
		// console.log(charityEventAddress);
		const CharityEventInstance = CharityEvent.at(charityEventAddress);

		await OrganizationInstance.updateCharityEventDetails(charityEventAddress, name+'_updated', parseInt(target)+100, [0,1,2,3], metaHash+'_updated', {
			from: ADMIN_ACCOUNTS[0]
		});


		const charityEvenName = await CharityEventInstance.name();
		const charityEventTarget = (await CharityEventInstance.target()).toString();
		const charityEventPayed = (await CharityEventInstance.payed()).toString();
		const charityEventTags = await getCharityEventTags(CharityEventInstance);
		const charityEventMetaHash = (await CharityEventInstance.metaStorageHash()).toString();


		assert(charityEvenName === name+'_updated', 'Wrong charityEvent name');
		assert(charityEventTarget.toString() === (parseInt(target)+100).toString(), 'Wrong charityEvent target');
		assert(charityEventMetaHash === metaHash+'_updated', 'Wrong metaHash');
		assert(isEqualTags(charityEventTags, [0,1,2,3]), 'Wrong tags');
		assert(charityEventPayed.toString() === '0', 'Wrong payed');
	});

	it('should throw an error if try to edit charity event by non-admin account', async() => {
		const name = 'Test Charity Event';
		const target = '100';
		const payed = '0';
		const tags = [0, 1, 2];
		const metaHash = 'metaHash';

		const transactionDetails = await OrganizationInstance.addCharityEvent(name, target, payed, tags, metaHash, {
			from: ADMIN_ACCOUNTS[0]
		});
		const charityEventAddress = transactionDetails.logs[0].args.charityEvent;

		try {
			await OrganizationInstance.updateCharityEventDetails(charityEventAddress, name + '_updated', parseInt(target) + 100, [0, 1, 2, 3], metaHash + '_updated', {
				from: accounts[0]
			});
			assert(false, 'Update charity event without admin rights');
		} catch(e) {
			const transactionException = e.message.search('Exception while processing transaction: revert') !== -1;
			assert(transactionException, 'Update charity event without admin rights');
		}
	});

	it('should throw an error if try to call updateCharityEventDetails method directly', async() => {
		const name = 'Test Charity Event';
		const target = '100';
		const payed = '0';
		const tags = [0, 1, 2];
		const metaHash = 'metaHash';

		const transactionDetails = await OrganizationInstance.addCharityEvent(name, target, payed, tags, metaHash, {
			from: ADMIN_ACCOUNTS[0]
		});

		const charityEventAddress = transactionDetails.logs[0].args.charityEvent;
		const CharityEventInstance = CharityEvent.at(charityEventAddress);
		try {
			await CharityEventInstance.updateCharityEventDetails(name, target, tags, metaHash, {
				from: accounts[0]
			});

			assert(false, 'Update charity event directly bypass organization contract1');
		} catch(e) {
			const transactionException = e.message.search('Exception while processing transaction: revert') !== -1;
			assert(transactionException, 'Update charity event directly bypass organization contract');
		}
	});

	// it('should throw an error if try to set new CE target less than already raised amount', async() => {
	//
	// });
});


async function getCharityEventTags(charityEventInstance) {
	const tags = [];
	const tagsLength = await charityEventInstance.tagsLength();

	for (let i = 0; i < tagsLength; i++) {
		tags.push(parseInt(await charityEventInstance.tags(i)));
	}

	return tags;
}

function isEqualTags(tags1, tags2) {
	return (JSON.stringify(tags1) === JSON.stringify(tags2));
}
