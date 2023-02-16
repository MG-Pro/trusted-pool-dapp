// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "hardhat/console.sol";

import "./PoolTemplate.sol";

contract PoolFactory {
  address public owner;

  mapping(address => address[]) internal poolContracts; //creator -> contract
  mapping(address => address[]) internal participants; //participant -> contract

  modifier onlyOwner() {
    require(msg.sender == owner, "Only for owner");
    _;
  }

  constructor() {
    owner = msg.sender;
  }

  function createPoolContract(
    string memory _name,
    address _tokenAddress,
    string memory _tokenName,
    PoolTemplate.Participant[] memory _participants
  ) external {
    require(_participants.length != 0, "Must have at least 1 participant");
    address contractAddress = address(
      new PoolTemplate(msg.sender, _name, _tokenAddress, _tokenName, _participants)
    );

    poolContracts[msg.sender].push(contractAddress);
    saveParticipants(_participants, contractAddress);
  }

  function saveParticipants(
    PoolTemplate.Participant[] memory _participants,
    address contractAddress
  ) private {
    for (uint256 i; i < _participants.length; i++) {
      participants[_participants[i].account].push(contractAddress);
    }
  }

  function getContractAddressesByCreator(
    address _creator
  ) external view returns (address[] memory) {
    return poolContracts[_creator];
  }

  function getContractAddressesByParticipant(
    address _participants
  ) external view returns (address[] memory) {
    return participants[_participants];
  }
}
