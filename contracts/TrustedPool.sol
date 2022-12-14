// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "hardhat/console.sol";

contract TrustedPool {
  mapping(address => uint) users;
  string internal data = "123";
  address owner;

  modifier onlyOwner() {
    require(msg.sender == owner, "Only for owner");
    _;
  }

  constructor() {
    owner = msg.sender;
  }

  function getData() external view onlyOwner returns (string memory) {
    return data;
  }
}
