// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "hardhat/console.sol";

import "./PooledTemplate.sol";

contract TrustedPool {
  mapping(address => address) internal pooledContracts; //creator -> contract

  string internal data = "123";
  address public owner;

  modifier onlyOwner() {
    require(msg.sender == owner, "Only for owner");
    _;
  }

  constructor() {
    owner = msg.sender;
  }

  function createPooledContract(address _creator) external {
    pooledContracts[_creator] = new PooledTemplate(_creator);
  }

  function getPooledContractAddress(address _creator) external returns (address) {
    return pooledContracts[_creator];
  }

  function getData() external view onlyOwner returns (string memory) {
    return data;
  }
}
