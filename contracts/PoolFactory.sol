// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./PoolTemplate.sol";

contract PoolFactory {
  address public owner;
  uint public stableFeeValue;
  uint public stableApproverFeeValue;
  uint public contractCount;

  address private stableContract;
  uint private withdrawableBalance;

  mapping(uint => address) internal contracts; //id -> contract
  mapping(address => uint[]) internal creators; //creator -> ids
  mapping(address => uint[]) internal participants; //participant -> ids

  modifier onlyOwner() {
    require(msg.sender == owner, "Only for owner");
    _;
  }

  modifier hasStableContract() {
    require(stableContract != address(0), "Stable contract not set");
    _;
  }

  modifier existContract(address _contract) {
    bool exist;
    for (uint i; i <= contractCount; i++) {
      if (_contract == contracts[i]) {
        exist = true;
        break;
      }
    }
    require(exist, "Contract do not exist");
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
    withdrawableBalance += poolFee;

    if (_approver != address(0)) {
      poolFee += stableApproverFeeValue;
    }

    if (poolFee > 0) {
      _spendFee(poolFee);
    }

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

    contractCount++;
    contracts[contractCount] = contractAddress;
    creators[msg.sender].push(contractCount);
    saveParticipants(_participants);
  }

  function saveParticipants(PoolTemplate.Participant[] memory _participants) private {
    for (uint i; i < _participants.length; i++) {
      participants[_participants[i].account].push(contractCount);
    }
  }

  function approvePool(address _poolAddress) external existContract(_poolAddress) {
    (bool approved, address approver) = PoolTemplate(_poolAddress).approvalData();
    require(!approved, "Pool already approved");
    require(msg.sender == approver, "Only for approver");
    uint balance = IERC20(stableContract).balanceOf(address(this));
    require(balance >= stableApproverFeeValue, "Insufficient funds");
    bool success = IERC20(stableContract).transfer(msg.sender, stableApproverFeeValue);
    require(success, "Transfer failed");
    success = PoolTemplate(_poolAddress).approvePool();
    require(success, "Approve failed");
  }

  function setFeeValue(uint _fee) external onlyOwner {
    stableFeeValue = _fee;
  }

  function setApproverFeeValue(uint _fee) external onlyOwner {
    stableApproverFeeValue = _fee;
  }

  function setStableContract(address _stableAddress) external onlyOwner {
    stableContract = _stableAddress;
  }

  function getWithdrawableBalance() external view onlyOwner returns (uint) {
    return withdrawableBalance;
  }

  function getContractAddressesByCreator(
    address _address
  ) external view returns (address[] memory) {
    return _getContracts(creators[_address]);
  }

  function getContractAddressesByParticipant(
    address _address
  ) external view returns (address[] memory) {
    return _getContracts(participants[_address]);
  }

  function _getContracts(uint[] memory _ids) private view returns (address[] memory) {
    address[] memory cs = new address[](_ids.length);
    for (uint i; i < _ids.length; i++) {
      cs[i] = contracts[_ids[i]];
    }
    return cs;
  }

  function _spendFee(uint _fee) private hasStableContract {
    uint balance = IERC20(stableContract).balanceOf(msg.sender);
    require(balance >= _fee, "Not enough fee value");
    uint result = IERC20(stableContract).allowance(msg.sender, address(this));
    require(result >= _fee, "Not allowed amount to spend");
    bool success = IERC20(stableContract).transferFrom(msg.sender, address(this), _fee);
    require(success, "Spending failed");
  }

  function withdraw() external onlyOwner hasStableContract {
    require(withdrawableBalance > 0, "Nothing to withdraw");
    bool success = IERC20(stableContract).transfer(owner, withdrawableBalance);
    require(success, "Withdraw failed");
  }
}
