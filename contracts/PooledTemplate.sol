// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PooledTemplate {
  address public creator;

  constructor(address _creator) {
    creator = _creator;
  }
}
