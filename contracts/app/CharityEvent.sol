pragma solidity 0.4.23;

import "./OrganizationInterface.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract CharityEvent is Ownable {

    // name of event
    string public name;

    // how much funds is required
    uint public target;

    // how much funds payed to needy
    uint public payed;

    bytes1 public tags;

	string public metaStorageHash;


    constructor(string _name, uint _target, uint _payed, bytes1 _tags, string _metaStorageHash) public {
        require(_target > 0);
        require(_payed >= 0);

        name = _name;
        target = _target;
        payed = _payed;
        tags = _tags;

		metaStorageHash = _metaStorageHash;
    }


	/**
     * @dev Update charity event data
     * @param _name New name
     * @param _target New target
     * @param _tags New tags
     * @param _metaStorageHash New metaStorageHash
     */
	function updateCharityEventDetails(string _name, uint _target, bytes1 _tags, string _metaStorageHash) public onlyOwner returns(bool) {

		name = _name;

		target = _target;

		tags = _tags;

		metaStorageHash = _metaStorageHash;

		return true;
	}



	function updateMetaStorageHash(string _metaStorageHash) public  {
		metaStorageHash = _metaStorageHash;
	}

	/**
     * @dev Compares 2 hashes and returns true if they are the same
     * @param _toCompare String to compare with
     */
	function isTheSameMetaStorageHash(string _toCompare) public view returns(bool) {
		return (keccak256(metaStorageHash) == keccak256(_toCompare));
	}


	// check that contract is charity event contract
	function isCharityEvent() pure external returns (bool) {
		return true;
	}


}
