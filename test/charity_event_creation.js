const Organization = artifacts.require('Organization');
const Employee = artifacts.require('Employee');
const Tools = artifacts.require('Tools');
const SafeMath = artifacts.require('SafeMath');
const OpenCharityToken = artifacts.require('OpenCharityToken');
const tokenParams = require('../contracts-params').token;
const CharityEvent = artifacts.require('CharityEvent');


contract('Organization', function(accounts) {
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

        const transactionDetails = await OrganizationInstance.addCharityEvent(name, target, payed, "0", {
            from: ADMIN_ACCOUNTS[0]
        });
        const charityEventAddress = transactionDetails.logs[0].args.charityEvent;
        console.log(charityEventAddress);
        const CharityEventInstance = CharityEvent.at(charityEventAddress);

        const charityEvenName = await CharityEventInstance.name();
        const charityEventTarget = (await CharityEventInstance.target()).toString();
        const charityEventPayed = (await CharityEventInstance.payed()).toString();

        assert(charityEvenName === name, 'Wrong charityEvent name');
        assert(charityEventTarget === target, 'Wrong charityEvent target');
        assert(charityEventPayed === payed, 'Wrong charityEvent payed');
    });

    // it('should throw an error if addCharityEvent method called by non-admin', async () => {
    //     try {
    //         await OrganizationInstance.addEmployee('Rick', 'Sanchez', {from: accounts[3]});
    //         assert(false, 'Allow create users for account without admin rights');
    //     } catch (exception) {
    //         const transactionException = exception.message.search('Exception while processing transaction: revert') !== -1;
    //         assert(transactionException, 'Allow create users for account without admin rights');
    //     }
    // });

});
