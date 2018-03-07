pragma solidity ^0.4.17;

import "./lib/Tools.sol";
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


    function CharityEvent(string _name, uint _target, uint _payed, bytes1 _tags, string _metaStorageHash) public {
        require(_target > 0);
        require(_payed >= 0);
        require(!Tools.isEmptyString(_name));

        name = _name;
        target = _target;
        payed = _payed;
        tags = _tags;

		metaStorageHash = _metaStorageHash;
    }

    // check that contract is charity event contract
    function isCharityEvent() pure external returns (bool) {
        return true;
    }


	/**
     * @dev Update editable fields of charity event
	 *
     */
	function updateDetails(string _name, uint256 _target, bytes1 _tags, string _metaStorageHash) public returns(bool) {
		// all checks and validations have to be done in Organization method

		name = _name;

		target = _target;

		tags = _tags;

		metaStorageHash = _metaStorageHash;

		return true;
	}


}
