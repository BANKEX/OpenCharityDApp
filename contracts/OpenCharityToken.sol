pragma solidity ^0.4.17;

import "../node_modules/zeppelin-solidity/contracts/token/DetailedERC20.sol";
import "../node_modules/zeppelin-solidity/contracts/token/BurnableToken.sol";
import "./OpenCharityMintableToken.sol";

contract OpenCharityToken is DetailedERC20, OpenCharityMintableToken, BurnableToken {


    function OpenCharityToken(string _name, string _symbol, uint8 _decimals)
    DetailedERC20(_name, _symbol, _decimals)
    public {

        // methods below are only for testing during developement.
        // they have to be removed before production

        // set owner as mintAgent.
        setMintAgent(msg.sender, true);
        // create some tokens for the owner
        mint(msg.sender, 1000000 * (10**18));

    }

}
