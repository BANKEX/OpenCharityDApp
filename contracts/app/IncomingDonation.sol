pragma solidity ^0.4.17;

import '../OpenCharityToken.sol';
import './CharityEvent.sol';

contract IncomingDonation {

    OpenCharityToken public token;

    // this field helps to identify and link fiat payment
    // with entity inside the OpenCharity
    // for example bank transaction ID
    string public realWorldIdentifier;

    // 0 in bytes format
    bytes1 zeroBytes = 0x00;

    // tags assigned to donation
    bytes1 public tags;

    // optional note. can be anything or empty
    string public note;


    function IncomingDonation(address _token, string _realWorldIdentifier, string _note, bytes1 _tags) public {
        require(_token != address(0x0));

        token = OpenCharityToken(_token);

        realWorldIdentifier = _realWorldIdentifier;
        note = _note;
        tags = _tags;
    }

    function moveToCharityEvent(address _charityEvent, uint _amount) public returns(bool) {
        require(_amount > 0);

        CharityEvent charityEvent = CharityEvent(_charityEvent);

        require(charityEvent.isCharityEvent());

        require(validateTags(tags, charityEvent.tags()));

        token.transfer(_charityEvent, _amount);

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

    // check that contract is charity event contract
    function isIncomingDonation() pure public returns (bool) {
        return true;
    }


}
