pragma solidity ^0.4.17;

import "./Employee.sol";
import "./CharityEvent.sol";
import "./IncomingDonation.sol";
import "../OpenCharityMintableToken.sol";


contract Organization {
    OpenCharityMintableToken token;

    string public name;

    // list of admins
    mapping(address => bool) public admins;

    // list of Employees
    // additional mapping and counter provide iterability
    mapping(address => bool) public employees;
    mapping(uint => address) public employeeIndex;
    uint public employeeCount = 0;
    event EmployeeAdded(address indexed organization, address employee);

    //list of CharityEvents
    mapping(address => bool) public charityEvents;
    mapping(uint => address) public charityEventIndex;
    uint public charityEventCount = 0;
    event CharityEventAdded(address indexed organization, address charityEvent);


    //list of IncomingDonations
    mapping(address => bool) public incomingDonations;
    mapping(uint => address) public incomingDonationIndex;
    uint public incomingDonationCount = 0;
    event IncomingDonationAdded(address indexed organization, address incomingDonation, address indexed who, uint amount);



    function Organization(OpenCharityMintableToken _token, address[] _admins, string _name) public {
        // at least one admin is required
        require(_admins.length > 0);

        // check that admins addresses array doesn't have empty ones
        for(uint i = 0; i < _admins.length; i++) {
            require(_admins[i] != address(0x0));
            admins[_admins[i]] = true;
        }

        name = _name;
        token = OpenCharityMintableToken(_token);
    }


    /**
   * @dev Add new employee to Organization
   */
    function addEmployee(string _firstName, string _lastName) public onlyAdmin returns(address) {
        // create a new employee
        Employee employee = new Employee(_firstName, _lastName);

        // add employee to employees list
        employeeIndex[employeeCount] = employee;
        employees[employee] = true;
        employeeCount++;

        // broadcast event
        EmployeeAdded(this, employee);

        return employee;
    }

    /**
   * @dev Add new CharityEvent to Organization
   */
    function addCharityEvent(string _name, uint _target, uint _payed, bytes1 _tags) public onlyAdmin returns(address) {
        CharityEvent charityEvent = new CharityEvent(_name, _target, _payed, _tags);

        // add charityEvent to charityEvents list
        charityEventIndex[charityEventCount] = charityEvent;
        charityEvents[charityEvent] = true;
        charityEventCount++;

        // broadcast event
        CharityEventAdded(this, charityEvent);

        return charityEvent;
    }

    function setIncomingDonation(string _realWorldIdentifier, uint _amount, string _note, bytes1 _tags) public onlyAdmin returns(address) {
        address incomingDonation = addIncomingDonation(_realWorldIdentifier, _amount, _note, _tags);

        token.mint(incomingDonation, _amount);
    }

    /**
     * @dev Add new IncomingDonation to Organization
     */
    function addIncomingDonation(string _realWorldIdentifier, uint _amount, string _note, bytes1 _tags) internal returns(address) {

        IncomingDonation incomingDonation = new IncomingDonation(token, _realWorldIdentifier, _note, _tags);

        // add incomingDonation to incomingDonations list
        incomingDonationIndex[incomingDonationCount] = incomingDonation;
        incomingDonations[incomingDonation] = true;
        incomingDonationCount++;

        // broadcast event
        IncomingDonationAdded(this, incomingDonation, msg.sender, _amount);

        return incomingDonation;
    }

    function isAdmin() view external returns (bool) {
        return(admins[msg.sender]);
    }

    /**
     * @dev Add or revoke admin rights for address
     */
    function setAdmin(address admin, bool value) public onlyAdmin {
        admins[admin] = value;
    }


    modifier onlyAdmin() {
        require(admins[msg.sender]);
        _;
    }
}
