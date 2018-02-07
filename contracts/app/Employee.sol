pragma solidity ^0.4.17;

import "./lib/Tools.sol";

contract Employee {

    string public firstName;
    string public lastName;

    function Employee(string _firstName, string _lastName) public {
        require(!Tools.isEmptyString(_firstName));
        require(!Tools.isEmptyString(_lastName));

        firstName = _firstName;
        lastName = _lastName;
    }
}
