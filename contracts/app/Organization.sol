pragma solidity 0.4.21;

import "./Employee.sol";
import "./CharityEvent.sol";
import "./IncomingDonation.sol";
import "./interfaces/OpenCharityTokenInterface.sol";


contract Organization {
	OpenCharityTokenInterface token;

	string public name;

	// list of admins
	mapping(address => bool) public admins;

	// list of CharityEvents
	mapping(address => bool) public charityEvents;
	mapping(uint => address) public charityEventIndex;
	uint public charityEventCount = 0;
	event CharityEventAdded(address indexed charityEvent);
	event CharityEventEdited(address indexed charityEvent, address indexed who);


	// list of IncomingDonations
	mapping(address => bool) public incomingDonations;
	mapping(uint => address) public incomingDonationIndex;
	uint public incomingDonationCount = 0;
	event IncomingDonationAdded(address indexed incomingDonation, uint amount, uint sourceId);

	// Triggered when meta storage of some smart contract is updated
	event MetaStorageHashUpdated(address indexed ownerAddress, string metaStorageHash);

	// Counter is used to represents ids of incoming donations
	// for now names are hardcoded in front end,
	// later they will be stored in meta storage
	uint public incomingDonationsSourceIds = 0;

	// names of incoming donations sources
	mapping(uint => string) public incomingDonationsSourceName;

	// number of block when smart contract was deployed
	uint public creationBlockNumber;


	/**
     * @dev Events emitted when donation funds moved to charity event
     * @param charityEvent address of target charity event
     * @param sender address which initiate transaction
     * @param amount how much tokens moved
     */
	event FundsMovedToCharityEvent(address indexed incomingDonation, address indexed charityEvent, address indexed sender, uint amount);



	function Organization(OpenCharityTokenInterface _token, address[] _admins, string _name) public {
		// at least one admin is required
		require(_admins.length > 0);

		// check that admins addresses array doesn't have empty ones
		for(uint i = 0; i < _admins.length; i++) {
			require(_admins[i] != address(0x0));
			admins[_admins[i]] = true;
		}

		name = _name;
		token = OpenCharityTokenInterface(_token);

		creationBlockNumber = block.number;

	}

	/**
     * @dev Add new CharityEvent to Organization
     */
	function addCharityEvent(string _name, uint _target, uint _payed, bytes1 _tags, string _metaStorageHash) public onlyAdmin returns(address) {
		CharityEvent charityEvent = new CharityEvent(_name, _target, _payed, _tags, _metaStorageHash);

		// add charityEvent to charityEvents list
		charityEventIndex[charityEventCount] = charityEvent;
		charityEvents[charityEvent] = true;
		charityEventCount++;

		// broadcast event
		CharityEventAdded(charityEvent);

		return charityEvent;
	}

	function setIncomingDonation(string _realWorldIdentifier, uint _amount, string _note, bytes1 _tags, uint _sourceId) public onlyAdmin returns(address) {
		address incomingDonation = addIncomingDonation(_realWorldIdentifier, _amount, _note, _tags, _sourceId);

		token.mint(incomingDonation, _amount);

		return incomingDonation;
	}

	/**
     * @dev Add new IncomingDonation to Organization
     */
	function addIncomingDonation(string _realWorldIdentifier, uint _amount, string _note, bytes1 _tags, uint _sourceId) internal returns(address) {
		require(_sourceId >= 0 && _sourceId <= incomingDonationsSourceIds);

		IncomingDonation incomingDonation = new IncomingDonation(token, _realWorldIdentifier, _note, _tags, _sourceId);

		// add incomingDonation to incomingDonations list
		incomingDonationIndex[incomingDonationCount] = incomingDonation;
		incomingDonations[incomingDonation] = true;
		incomingDonationCount++;

		// broadcast event
		IncomingDonationAdded(incomingDonation, _amount, _sourceId);

		return incomingDonation;
	}

	function moveDonationFundsToCharityEvent(address _incomingDonation, address _charityEvent, uint _amount) public {
		// check that it is IncomingDonation contract
		require(IncomingDonation(_incomingDonation).isIncomingDonation());

		// check that it is CharityEvent contract
		require(CharityEvent(_charityEvent).isCharityEvent());

		// move funds
		require(IncomingDonation(_incomingDonation).moveToCharityEvent(_charityEvent, _amount));

		FundsMovedToCharityEvent(_incomingDonation, _charityEvent, msg.sender, _amount);

	}

	function updateCharityEventMetaStorageHash(address _charityEvent, string _hash) public onlyAdmin {
		// check that it is CharityEvent contract
		require(CharityEvent(_charityEvent).isCharityEvent());

		CharityEvent(_charityEvent).updateMetaStorageHash(_hash);

		MetaStorageHashUpdated(_charityEvent, _hash);

		CharityEventEdited(_charityEvent, msg.sender);
	}

	/**
     * @dev Update charity event data
     * @param _name New name
     * @param _target New target
     * @param _tags New tags
     * @param _metaStorageHash New metaStorageHash
     */
	function updateCharityEventDetails(address _charityEvent, string _name, uint _target, bytes1 _tags, string _metaStorageHash) public onlyAdmin returns(bool) {
		require(_charityEvent != address(0x0));
		// check that it is CharityEvent contract
		CharityEvent charityEvent = CharityEvent(_charityEvent);
		require(charityEvent.isCharityEvent());

		// new target cannot be less that raised amount
		require(token.balanceOf(charityEvent) <= _target);

		bool isMetaStorageUpdated = !(charityEvent.isTheSameMetaStorageHash(_metaStorageHash));
		// update charity event details
		require(charityEvent.updateCharityEventDetails(_name, _target, _tags, _metaStorageHash));

		CharityEventEdited(_charityEvent, msg.sender);

		if (isMetaStorageUpdated) {
			MetaStorageHashUpdated(charityEvent, _metaStorageHash);
		}

		return true;
	}


	//Donations sources
	/**
     * @dev Add new incoming donations source
     * @param _name Name of source
     */
	function addIncomingDonationSource(string _name) public onlyAdmin returns(uint) {
		incomingDonationsSourceName[incomingDonationsSourceIds] = _name;

		incomingDonationsSourceIds = incomingDonationsSourceIds + 1;

		return incomingDonationsSourceIds - 1;
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
