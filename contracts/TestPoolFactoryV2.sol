// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
//import "hardhat/console.sol";

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "./PoolTemplate.sol";

struct PoolData {
  bytes32 name;
  bytes32 tokenName;
  address tokenAddress;
  address approver;
  bool privatable;
  bool finalized;
}

contract TestPoolFactoryV2 is Initializable, OwnableUpgradeable, UUPSUpgradeable {
  event PoolCreated(address indexed contractAddress, uint256 indexed id);

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
    PoolData calldata data,
    address[] calldata _participants,
    uint256[] calldata _shares
  ) external checkParticipantCount(_participants.length) {
    require(_isZeroAddress(finalizingContracts[msg.sender]), "Creator have finalizing pool");
    uint256 poolFee = stableFeeValue;
    withdrawableBalance += poolFee;

    if (!_isZeroAddress(data.approver)) {
      poolFee += stableApproverFeeValue;
    }

    if (poolFee > 0) {
      _spendFee(poolFee);
    }

    address contractAddress = Clones.clone(templateImplementation);
    PoolTemplate pool = PoolTemplate(contractAddress);
    pool.init(
      msg.sender,
      data.name,
      data.tokenAddress,
      data.tokenName,
      data.approver,
      data.privatable
    );
    pool.addParticipants(_participants, _shares);
    contracts[contractCount] = contractAddress;

    if (data.finalized) {
      pool.finalize();
    } else {
      finalizingContracts[msg.sender] = contractAddress;
    }

    emit PoolCreated(contractAddress, contractCount);
    unchecked {
      ++contractCount;
    }
  }

  function addParticipants(
    address[] calldata _participants,
    uint256[] calldata _shares
  ) external checkParticipantCount(_participants.length) checkFinalizing {
    PoolTemplate(finalizingContracts[msg.sender]).addParticipants(_participants, _shares);
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
    for (uint256 i; i < contractCount; ) {
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

      unchecked {
        i++;
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
    if (_isZeroAddress(_contract)) {
      return false;
    }
    for (uint256 i; i <= contractCount; ) {
      if (_contract == contracts[i]) {
        exist = true;
        break;
      }
      unchecked {
        i++;
      }
    }
  }

  function _hasStableContract() private view {
    require(!_isZeroAddress(stableContract), "Stable contract not set");
  }

  function _checkParticipantCount(uint256 length) private pure {
    if (length == 0 || length > maxParticipantsTs) {
      revert WrongParticipantCount();
    }
  }

  function _checkFinalizing() private view {
    if (!_existContract(finalizingContracts[msg.sender])) {
      revert NoFinalizingPoolForSender();
    }
  }

  function _isZeroAddress(address _address) private pure returns (bool) {
    return _address == address(0);
  }

  function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

  function getTestDataV2() external view onlyOwner returns (address) {
    return owner();
  }
}
