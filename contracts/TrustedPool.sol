// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "hardhat/console.sol";

import "./PooledTemplate.sol";

contract TrustedPool {
  address public owner;

  mapping(address => address) internal pooledContracts; //creator -> contract
  mapping(address => address[]) internal participants; //participant -> contract

  modifier onlyOwner() {
    require(msg.sender == owner, "Only for owner");
    _;
  }

  constructor() {
    owner = msg.sender;
  }

  function createPooledContract(
    string memory _name,
    address _tokenAddress,
    string memory _tokenName,
    uint256 _tokenAmount,
    PooledTemplate.Participant[] memory _participants
  ) external {
    pooledContracts[msg.sender] = address(
      new PooledTemplate(msg.sender, _name, _tokenAddress, _tokenName, _tokenAmount, _participants)
    );
  }

  function saveParticipants(PooledTemplate.Participant[] memory _participants) internal {
    for (uint256 i; i < _participants.length; i++) {
      if (participants[_participants[i].account].length > 0) {} else {
        participants[_participants[i].account] = [pooledContracts[msg.sender]];
      }
    }
  }

  function getPooledContractAddress(address _creator) external view returns (address) {
    return pooledContracts[_creator];
  }
}
