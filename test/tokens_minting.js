const Organization = artifacts.require('Organization');
const Employee = artifacts.require('Employee');
const Tools = artifacts.require('Tools');
const SafeMath = artifacts.require('SafeMath');
const OpenCharityToken = artifacts.require('OpenCharityToken');
const tokenParams = require('../contracts-params').token;

contract('OpenCharityToken', function(accounts) {


    let OpenCharityTokenInstance;
    beforeEach(async () => {
        const SafeMathInstance = await SafeMath.new();
        await OpenCharityToken.link('SafeMath', SafeMathInstance.address);
        OpenCharityTokenInstance = await OpenCharityToken.new('Test', 'TST', tokenParams.decimals);
    });

    it('should doesn\'t allow minting for not mintAgents', async () => {
        const ACCOUNT = accounts[1];
        try {
            await OpenCharityTokenInstance.mint(ACCOUNT, 100, {
                from: ACCOUNT,
                gas: 100000
            });
            assert(false, 'Allow minting for not mintAgents');
        } catch (e) {
            const transactionException = e.message.search('Exception while processing transaction: revert') !== -1;
            assert(transactionException, 'Allow minting for not mintAgents');
        }
    });

    it('should set mintAgent and mint new tokens', async () => {
        const ACCOUNT = accounts[2];
        await OpenCharityTokenInstance.setMintAgent(ACCOUNT, true);

        await OpenCharityTokenInstance.mint(ACCOUNT, 100, {
            from: ACCOUNT,
            gas: 100000
        });

        const balance = await OpenCharityTokenInstance.balanceOf(ACCOUNT);
        assert(balance.toString() === '100', 'Invalid balance. Tokens were not minted');
    });







});
