// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "hardhat/console.sol";

import "./PooledTemplate.sol";

contract TrustedPool {
  address public owner;

  mapping(address => address[]) internal pooledContracts; //creator -> contract
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
    PooledTemplate.Participant[] memory _participants
  ) external {
    address contractAddress = address(
      new PooledTemplate(msg.sender, _name, _tokenAddress, _tokenName, _participants)
    );

    pooledContracts[msg.sender].push(contractAddress);
    saveParticipants(_participants, contractAddress);
  }

  function saveParticipants(
    PooledTemplate.Participant[] memory _participants,
    address contractAddress
  ) internal {
    for (uint256 i; i < _participants.length; i++) {
      participants[_participants[i].account].push(contractAddress);
    }
  }

  function getContractAddressesByCreator(
    address _creator
  ) external view returns (address[] memory) {
    return pooledContracts[_creator];
  }

  function getContractAddressesByParticipant(
    address _participants
  ) external view returns (address[] memory) {
    return participants[_participants];
  }
}
