// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./PoolTemplate.sol";

contract PoolFactory {
  address public owner;
  uint public stableFeeValue;
  uint public stableApproverFeeValue;

  address private stableContract;
  uint private withdrawableBalance;

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
    address _approver,
    bool _privatable
  ) external {
    require(_participants.length != 0, "Must have at least 1 participant");

    uint poolFee = stableFeeValue;
    if (_approver != address(0)) {
      poolFee += stableApproverFeeValue;
    }

    if (poolFee > 0) {
      _spendFee(poolFee);
    }
    withdrawableBalance += poolFee;
    address contractAddress = address(
      new PoolTemplate(
        msg.sender,
        _name,
        _tokenAddress,
        _tokenName,
        _participants,
        _approver,
        _privatable
      )
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

  function approvePool(address _poolAddress) external {
    (bool approved, address approver) = PoolTemplate(_poolAddress).approvalData();
    require(!approved, "Pool already approved");
    require(msg.sender == approver, "Only for approver");
    uint256 balance = IERC20(stableContract).balanceOf(address(this));
    require(balance >= stableApproverFeeValue, "Insufficient funds");

    bool success = IERC20(stableContract).transfer(msg.sender, stableApproverFeeValue);
    require(success, "Transfer failed");
  }

  function setFeeValue(uint256 _fee) external onlyOwner {
    stableFeeValue = _fee;
  }

  function setApproverFeeValue(uint256 _fee) external onlyOwner {
    stableApproverFeeValue = _fee;
  }

  function setStableContract(address _stableAddress) external onlyOwner {
    stableContract = _stableAddress;
  }

  function getWithdrawableBalance() external view onlyOwner returns (uint) {
    return withdrawableBalance;
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

  function _spendFee(uint _fee) private hasStableContract {
    uint256 balance = IERC20(stableContract).balanceOf(msg.sender);
    require(balance >= _fee, "Not enough fee value");
    uint256 result = IERC20(stableContract).allowance(msg.sender, address(this));
    require(result >= _fee, "Not allowed amount to spend");
    bool success = IERC20(stableContract).transferFrom(msg.sender, address(this), _fee);
    require(success, "Spending failed");
  }

  function withdraw() external onlyOwner hasStableContract {
    require(withdrawableBalance > 0, "Nothing to withdraw");
    bool success = IERC20(stableContract).transfer(owner, withdrawableBalance);
    require(success, "Transfer failed");
  }
}
