pragma solidity 0.4.21;

import "zeppelin-solidity/contracts/token/ERC20/ERC20Basic.sol";

contract OpenCharityTokenInterface is ERC20Basic {

	/** List of agents that are allowed to create new tokens */
	mapping (address => bool) public mintAgents;

	/**
     * Owner can allow another contract to mint new tokens.
     */
	function setMintAgent(address addr, bool state)  public;

	/**
   * @dev Function to mint tokens
   * @param _to The address that will receive the minted tokens.
   * @param _amount The amount of tokens to mint.
   * @return A boolean that indicates if the operation was successful.
   */
	function mint(address _to, uint256 _amount) public returns (bool);

	function mintTest(address _to, uint256 _amount) public returns (bool);

    function transfer(address _to, uint256 _value) public returns (bool);

}
