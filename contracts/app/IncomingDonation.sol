pragma solidity ^0.4.18;

contract IncomingDonation {

    // this field helps to identify and link fiat payment
    // with entity inside the OpenCharity
    // for example bank transaction ID
    string public realWorldIdentifier;

    // tags assigned to donation
    bytes1 public tags;

    // optional note. can be anything or empty
    string public note;


    function IncomingDonation(string _realWorldIdentifier, string _note, bytes1 _tags) public {
        realWorldIdentifier = _realWorldIdentifier;

        note = _note;

        tags = _tags;
    }



    // check that contract is incoming donation contract
    function isIncomingDonation() pure public returns (bool) {
        return true;
    }


}
