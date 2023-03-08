// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
import "hardhat/console.sol";

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./PoolTemplate.sol";

contract PoolFactory is Ownable {
  event PoolCreated(address indexed contractAddress, uint256 indexed id);

  uint256 public stableFeeValue;
  uint256 public stableApproverFeeValue;
  uint256 public contractCount;
  address private immutable templateImplementation;
  address private stableContract;
  uint256 private withdrawableBalance;

  mapping(uint256 => address) internal contracts; //id -> contract

  modifier hasStableContract() {
    require(stableContract != address(0), "Stable contract not set");
    _;
  }

  modifier existContract(address _contract) {
    bool exist;
    for (uint256 i; i <= contractCount; i++) {
      if (_contract == contracts[i]) {
        exist = true;
        break;
      }
    }
    require(exist, "Contract do not exist");
    _;
  }

  constructor() {
    templateImplementation = address(new PoolTemplate());
  }

  function createPoolContract(
    string calldata _name,
    address _tokenAddress,
    string calldata _tokenName,
    PoolTemplate.Participant[] calldata _participants,
    address _approver,
    bool _privatable
  ) external {
    require(_participants.length != 0, "Must have at least 1 participant");
    uint256 poolFee = stableFeeValue;
    withdrawableBalance += poolFee;

    if (_approver != address(0)) {
      poolFee += stableApproverFeeValue;
    }

    if (poolFee > 0) {
      _spendFee(poolFee);
    }

    address contractAddress = Clones.clone(templateImplementation);
    PoolTemplate poolTemplate = PoolTemplate(contractAddress);

    poolTemplate.init(msg.sender, _name, _tokenAddress, _tokenName, _approver, _privatable);

    poolTemplate.addParticipants(_participants);
    contracts[contractCount] = contractAddress;

    emit PoolCreated(contractAddress, contractCount);
    contractCount++;
  }

  function approvePool(address _poolAddress) external existContract(_poolAddress) {
    (bool approved, address approver) = PoolTemplate(_poolAddress).approvalData();
    require(!approved, "Pool already approved");
    require(msg.sender == approver, "Only for approver");
    uint256 balance = IERC20(stableContract).balanceOf(address(this));
    require(balance >= stableApproverFeeValue, "Insufficient funds");
    bool success = IERC20(stableContract).transfer(msg.sender, stableApproverFeeValue);
    require(success, "Transfer failed");
    success = PoolTemplate(_poolAddress).approvePool();
    require(success, "Approve failed");
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

  function getWithdrawableBalance() external view onlyOwner returns (uint256) {
    return withdrawableBalance;
  }

  function getContractAddressesByParticipant(
    address _address
  ) external view returns (address[] memory) {
    (, uint256 count) = _requestContracts(_address, contractCount);
    (address[] memory list, ) = _requestContracts(_address, count);
    return list;
  }

  function withdraw() external onlyOwner hasStableContract {
    require(withdrawableBalance > 0, "Nothing to withdraw");
    bool success = IERC20(stableContract).transfer(owner(), withdrawableBalance);
    require(success, "Withdraw failed");
  }

  function _requestContracts(
    address _address,
    uint256 len
  ) private view returns (address[] memory, uint256 count) {
    uint256 counter;
    address[] memory list = new address[](len);
    for (uint256 i; i < contractCount; i++) {
      bool exist;
      try PoolTemplate(contracts[i]).hasParticipant(_address) returns (bool res) {
        exist = res;
      } catch {
        exist = false;
      }

      if (exist) {
        list[counter] = contracts[i];
        counter++;
      }
    }

    return (list, counter);
  }

  function _spendFee(uint256 _fee) private hasStableContract {
    uint256 balance = IERC20(stableContract).balanceOf(msg.sender);
    require(balance >= _fee, "Not enough fee value");
    uint256 result = IERC20(stableContract).allowance(msg.sender, address(this));
    require(result >= _fee, "Not allowed amount to spend");
    bool success = IERC20(stableContract).transferFrom(msg.sender, address(this), _fee);
    require(success, "Spending failed");
  }
}
