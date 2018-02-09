pragma solidity ^0.4.17;

import "../node_modules/zeppelin-solidity/contracts/token/MintableToken.sol";

/**
 * @title Open Charity Mintable token
 * @dev Extends zeppelin Mintable token.
 * Add mintAgents to manage addresses that can mint new tokens
 */

contract OpenCharityMintableToken is MintableToken {

    /** List of agents that are allowed to create new tokens */
    mapping (address => bool) public mintAgents;

    event MintingAgentChanged(address addr, bool state);


    /**
     * Owner can allow another contract to mint new tokens.
     */
    function setMintAgent(address addr, bool state) onlyOwner canMint public {
        mintAgents[addr] = state;
        MintingAgentChanged(addr, state);
    }

    /**
   * @dev Function to mint tokens
   * @param _to The address that will receive the minted tokens.
   * @param _amount The amount of tokens to mint.
   * @return A boolean that indicates if the operation was successful.
   */
    function mint(address _to, uint256 _amount) onlyMintAgent canMint public returns (bool) {
        totalSupply = totalSupply.add(_amount);
        balances[_to] = balances[_to].add(_amount);
        Mint(_to, _amount);
        Transfer(address(0), _to, _amount);
        return true;
    }

    function mintTest(address _to, uint256 _amount) onlyMintAgent canMint public returns (bool) {
        totalSupply = totalSupply.add(_amount);
        balances[_to] = balances[_to].add(_amount);
        Mint(_to, _amount);
        Transfer(address(0), _to, _amount);
        return true;
    }


    modifier onlyMintAgent() {
        if(!mintAgents[msg.sender]) {
            revert();
        }
        _;
    }



}
