// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "hardhat/console.sol";

import "./PooledTemplate.sol";

contract TrustedPool {
  mapping(address => PooledTemplate) internal pooledContracts;

  string internal data = "123";
  address public owner;

  modifier onlyOwner() {
    require(msg.sender == owner, "Only for owner");
    _;
  }

  constructor() {
    owner = msg.sender;
  }

  function createPooledContact(address _creator) external {}

  function getData() external view onlyOwner returns (string memory) {
    return data;
  }
}
