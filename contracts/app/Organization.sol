pragma solidity ^0.4.17;

import "./Employee.sol";
import "./CharityEvent.sol";
import "./IncomingDonation.sol";
import "./interfaces/OpenCharityTokenInterface.sol";


contract Organization {
    OpenCharityTokenInterface token;

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
	event CharityEventEdited(address indexed charityEvent, address indexed sender);


    //list of IncomingDonations
    mapping(address => bool) public incomingDonations;
    mapping(uint => address) public incomingDonationIndex;
    uint public incomingDonationCount = 0;
    event IncomingDonationAdded(address indexed organization, address incomingDonation, address indexed who, uint amount);

	// 0 in bytes format
	bytes1 zeroBytes = 0x00;




	/**
     * @dev Events emitted when donation funds moved to charity event
     * @param charityEvent address of target charity event
     * @param sender address which initiate transaction
     * @param amount how much tokens moved
     */
	event FundsMovedToCharityEvent(address indexed incomingDonation, address indexed charityEvent, address indexed sender, uint amount);



    function Organization(address _token, address[] _admins, string _name) public {
        // at least one admin is required
        require(_admins.length > 0);

        // check that admins addresses array doesn't have empty ones
        for(uint i = 0; i < _admins.length; i++) {
            require(_admins[i] != address(0x0));
            admins[_admins[i]] = true;
        }

        name = _name;
        token = OpenCharityTokenInterface(_token);
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
    function addCharityEvent(string _name, uint _target, uint _payed, bytes1 _tags, string _metaHashString) public onlyAdmin returns(address) {
        CharityEvent charityEvent = new CharityEvent(_name, _target, _payed, _tags, _metaHashString);

        // add charityEvent to charityEvents list
        charityEventIndex[charityEventCount] = charityEvent;
        charityEvents[charityEvent] = true;
        charityEventCount++;

        // broadcast event
        CharityEventAdded(this, charityEvent);

        return charityEvent;
    }

    /**
     * @dev Add new IncomingDonation to Organization
     */
    function addIncomingDonation(string _realWorldIdentifier, uint _amount, string _note, bytes1 _tags) internal onlyAdmin returns(address) {

        IncomingDonation incomingDonation = new IncomingDonation(_realWorldIdentifier, _note, _tags);

        // add incomingDonation to incomingDonations list
        incomingDonationIndex[incomingDonationCount] = incomingDonation;
        incomingDonations[incomingDonation] = true;
        incomingDonationCount++;

        // broadcast event
        IncomingDonationAdded(this, incomingDonation, msg.sender, _amount);

		token.mint(incomingDonation, _amount);

        return incomingDonation;
    }

	function moveDonationFundsToCharityEvent(address _incomingDonation, address _charityEvent, uint _amount) public returns(bool){
		require(_amount > 0);

		CharityEvent charityEvent = CharityEvent(_charityEvent);
		IncomingDonation incomingDonation = IncomingDonation(_incomingDonation);

		require(charityEvent.isCharityEvent());

		require(validateTags(incomingDonation.tags(), charityEvent.tags()));

		FundsMovedToCharityEvent(_incomingDonation, _charityEvent, msg.sender, _amount);

		token.transfer(_charityEvent, _amount);

		return true;

	}

	/**
	 * @dev Update editable fields of charity event
	 *
	 */
	function updateCharityEventDetails(address _charityEventAddress, string _name, uint256 _target, bytes1 _tags, string _metaStorageHash) public onlyAdmin returns(bool) {
		require(CharityEvent(_charityEventAddress).isCharityEvent());

		CharityEvent charityEvent = CharityEvent(_charityEventAddress);

		require(charityEvent.updateDetails(_name, _target, _tags, _metaStorageHash));

		return true;
	}


	/**
 * @dev Compare target charity event and incoming donation tags
 * returns true if at least one tag is the same
 * @param donationTags tags of incoming donation
 * @param eventTags tags of charity event
 */
	function validateTags(bytes1 donationTags, bytes1 eventTags) view public returns (bool)  {
		return ( (donationTags & eventTags) > zeroBytes);
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
