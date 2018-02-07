const Organization = artifacts.require('Organization');
const Employee = artifacts.require('Employee');
const Tools = artifacts.require('Tools');
const SafeMath = artifacts.require('SafeMath');
const OpenCharityToken = artifacts.require('OpenCharityToken');
const tokenParams = require('../contracts-params').token;


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
    });

    it('should create a new employee contract with specified details', async () => {
        const fname = 'Rick';
        const lname = 'Sanchez';
        const transactionDetails = await OrganizationInstance.addEmployee(fname, lname, {
            from: ADMIN_ACCOUNTS[0]
        });
        const employeeAddress = transactionDetails.logs[0].args.employee;
        const EmployeeInstance = Employee.at(employeeAddress);

        const employeeFirstName = await EmployeeInstance.firstName();
        const employeeLastName = await EmployeeInstance.lastName();

        assert(employeeFirstName === fname, 'Wrong employee first name');
        assert(employeeLastName === lname, 'Wrong employee last name');
    });

    it('should throw an error if addEmployee method called by non-admin', async () => {
        try {
            await OrganizationInstance.addEmployee('Rick', 'Sanchez', {from: accounts[3]});
            assert(false, 'Allow create users for account without admin rights');
        } catch (exception) {
            const transactionException = exception.message.search('Exception while processing transaction: revert') !== -1;
            assert(transactionException, 'Allow create users for account without admin rights');
        }
    });

});
