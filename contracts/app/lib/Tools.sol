pragma solidity ^0.4.17;


// TODO: find more descriptive name

library Tools {

    function isEmptyString(string memory str) pure public returns (bool) {
        bytes memory emptyTest = bytes(str);
        return (emptyTest.length == 0);
    }

}