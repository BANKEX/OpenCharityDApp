pragma solidity 0.4.21;

contract CharityEventInterface {
	// name of event
	string public name;

	// how much funds is required
	uint public target;

	// how much funds payed to needy
	uint public payed;

	bytes1 public tags;

	string public metaStorageHash;


	function createCharityEvent(string _name, uint _target, uint _payed, bytes1 _tags, string _metaStorageHash) external returns(address);

	// check that contract is charity event contract
	function isCharityEvent() pure external returns (bool);


	/**
     * @dev Update editable fields of charity event
	 *
     */
	function updateDetails(string _name, uint256 _target, bytes1 _tags, string _metaStorageHash) public returns(bool);


}
