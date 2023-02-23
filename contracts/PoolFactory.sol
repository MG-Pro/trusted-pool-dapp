// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./PoolTemplate.sol";

contract PoolFactory {
  address public owner;
  uint256 public stableFeeValue;
  address private stableContract;

  mapping(address => address[]) internal poolContracts; //creator -> contracts
  mapping(address => address[]) internal participants; //participant -> contracts

  modifier onlyOwner() {
    require(msg.sender == owner, "Only for owner");
    _;
  }

  modifier hasStableContract() {
    require(stableContract != address(0), "Stable contract not set");
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

    if (stableFeeValue > 0) {
      _spendFee();
    }

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

  function setFeeValue(uint256 _fee) external onlyOwner {
    stableFeeValue = _fee;
  }

  function setStableContract(address _stableAddress) external onlyOwner {
    stableContract = _stableAddress;
  }

  function getContractAddressesByCreator(
    address _creator
  ) external view returns (address[] memory) {
    return poolContracts[_creator];
  }

  function getContractAddressesByParticipant(
    address _participant
  ) external view returns (address[] memory) {
    return participants[_participant];
  }

  function _spendFee() private hasStableContract {
    uint256 balance = IERC20(stableContract).balanceOf(msg.sender);
    require(balance >= stableFeeValue, "Not enough fee value");
    uint256 result = IERC20(stableContract).allowance(msg.sender, address(this));
    require(result >= stableFeeValue, "Not allowed amount to spend");
    bool success = IERC20(stableContract).transferFrom(msg.sender, address(this), stableFeeValue);
    require(success, "Spending failed");
  }

  function withdraw() external onlyOwner hasStableContract {
    uint256 balance = IERC20(stableContract).balanceOf(address(this));
    require(balance > 0, "Nothing to withdraw");
    bool success = IERC20(stableContract).transfer(owner, balance);
    require(success, "Spending failed");
  }
}
