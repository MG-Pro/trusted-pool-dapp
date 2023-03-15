// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
import "hardhat/console.sol";

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "./PoolTemplate.sol";

contract PoolFactory is Initializable, OwnableUpgradeable, UUPSUpgradeable {
  event PoolCreated(address indexed contractAddress, uint256 indexed id);

  error WrongParticipantCount();

  uint16 private constant maxParticipantsTs = 450;

  uint256 public stableFeeValue;
  uint256 public stableApproverFeeValue;
  uint256 public contractCount;

  address private templateImplementation;
  address private stableContract;
  uint256 private withdrawableBalance;

  mapping(uint256 => address) private contracts; //id -> contract
  mapping(address => address) private finalizingContracts; //creator -> contract

  modifier hasStableContract() {
    _hasStableContract();
    _;
  }

  modifier existContract(address _poolAddress) {
    require(_existContract(_poolAddress), "Contract do not exist");
    _;
  }

  modifier checkParticipantCount(uint256 length) {
    _checkParticipantCount(length);
    _;
  }

  modifier checkFinalizing() {
    _checkFinalizing();
    _;
  }

  function initialize() public initializer {
    __Ownable_init();
    __UUPSUpgradeable_init();
    templateImplementation = address(new PoolTemplate());
  }

  function createPoolContract(
    bytes32 _name,
    address _tokenAddress,
    bytes32 _tokenName,
    PoolTemplate.Participant[] calldata _participants,
    address _approver,
    bool _privatable,
    bool _finalized
  ) external checkParticipantCount(_participants.length) {
    require(finalizingContracts[msg.sender] == address(0), "Creator have finalizing pool");
    uint256 poolFee = stableFeeValue;
    withdrawableBalance += poolFee;

    if (_approver != address(0)) {
      poolFee += stableApproverFeeValue;
    }

    if (poolFee > 0) {
      _spendFee(poolFee);
    }

    address contractAddress = Clones.clone(templateImplementation);
    PoolTemplate pool = PoolTemplate(contractAddress);
    pool.init(msg.sender, _name, _tokenAddress, _tokenName, _approver, _privatable);
    pool.addParticipants(_participants);
    contracts[contractCount] = contractAddress;

    if (_finalized) {
      pool.finalize();
    } else {
      finalizingContracts[msg.sender] = contractAddress;
    }

    emit PoolCreated(contractAddress, contractCount);
    unchecked {
      contractCount++;
    }
  }

  function addParticipants(
    PoolTemplate.Participant[] calldata _participants
  ) external checkParticipantCount(_participants.length) checkFinalizing {
    PoolTemplate(finalizingContracts[msg.sender]).addParticipants(_participants);
  }

  function finalize() external checkFinalizing {
    PoolTemplate(finalizingContracts[msg.sender]).finalize();
    delete finalizingContracts[msg.sender];
  }

  function approvePool(address _poolAddress) external existContract(_poolAddress) {
    (bool approved, address approver, ) = PoolTemplate(_poolAddress).getApprovalData();
    require(!approved, "Pool already approved");
    require(msg.sender == approver, "Only for approver");
    uint256 balance = IERC20(stableContract).balanceOf(address(this));
    require(balance >= stableApproverFeeValue, "Insufficient funds");
    bool success = IERC20(stableContract).transfer(msg.sender, stableApproverFeeValue);
    require(success, "Transfer failed");
    PoolTemplate(_poolAddress).approvePool();
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
    uint256 _len
  ) private view returns (address[] memory, uint256 count) {
    uint256 counter;
    address[] memory list = new address[](_len);
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

  function _existContract(address _contract) private view returns (bool exist) {
    if (_contract == address(0)) {
      return false;
    }
    for (uint256 i; i <= contractCount; i++) {
      if (_contract == contracts[i]) {
        exist = true;
        break;
      }
    }
  }

  function _hasStableContract() private view {
    require(stableContract != address(0), "Stable contract not set");
  }

  function _checkParticipantCount(uint256 length) private pure {
    if (length == 0 || length > maxParticipantsTs) {
      revert WrongParticipantCount();
    }
  }

  function _checkFinalizing() private view {
    require(_existContract(finalizingContracts[msg.sender]), "No finalizing pool for sender");
  }

  function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
