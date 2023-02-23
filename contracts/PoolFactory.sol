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
    PoolTemplate.Participant[] memory _participants,
    uint256 _stableFeeValue
  ) external {
    require(_participants.length != 0, "Must have at least 1 participant");

    if (stableFeeValue > 0) {
      _spendFee(_stableFeeValue);
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

  function _spendFee(uint256 _stableFeeValue) private hasStableContract {
    require(_stableFeeValue >= stableFeeValue, "Not enough fee value");
    _spend(msg.sender, address(this), _stableFeeValue);
  }

  function withdraw() external onlyOwner {
    uint256 balance = IERC20(stableContract).balanceOf(address(this));
    require(balance > 0, "Nothing to withdraw");
    _spend(address(this), owner, balance);
  }

  function _spend(address from, address to, uint256 amount) private {
    uint256 result = IERC20(stableContract).allowance(from, to);
    require(result >= amount, "Not allowed amount to spend");
    bool success = IERC20(stableContract).transferFrom(from, to, amount);
    require(success, "Spending failed");
  }
}
