pragma solidity ^0.4.17;

import "./lib/Tools.sol";
import "./OrganizationInterface.sol";

contract CharityEvent {

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

	function updateMetaStorageHash(string _metaStorageHash) public  {
		metaStorageHash = _metaStorageHash;
	}


}
