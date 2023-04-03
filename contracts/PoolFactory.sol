// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "./PoolTemplate.sol";

error WrongParticipantCount();
error NoFinalizingPoolForSender();
error ContractNotExist();
error CreatorHaveFinalizingPool();
error ApproverOnly();
error InsufficientFunds();
error NoStableContract();

contract PoolFactory is Initializable, OwnableUpgradeable, UUPSUpgradeable {
  event PoolCreated(address indexed contractAddress, uint256 indexed id);

  uint16 private constant maxParticipantsTs = 450;

  uint256 public stableFeeValue;
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
    if (!_existContract(_poolAddress)) {
      revert ContractNotExist();
    }
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
    if (!_isZeroAddress(finalizingContracts[msg.sender])) {
      revert CreatorHaveFinalizingPool();
    }
    uint256 poolFee = stableFeeValue;
    withdrawableBalance += poolFee;

    if (!_isZeroAddress(data.approver)) {
      poolFee += data.stableApproverFee;
    }

    if (poolFee != 0) {
      _spendFee(poolFee);
    }

    address contractAddress = Clones.clone(templateImplementation);
    PoolTemplate pool = PoolTemplate(contractAddress);
    pool.init(msg.sender, data);
    pool.addParticipants(_participants, _shares);
    contracts[contractCount] = contractAddress;

    if (data.finalized) {
      pool.finalize();
    } else {
      finalizingContracts[msg.sender] = contractAddress;
    }

    unchecked {
      ++contractCount;
    }
    emit PoolCreated(contractAddress, contractCount);
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
    (bool approved, address approver, uint256 stableApproverFee) = PoolTemplate(_poolAddress)
      .getApprovalData();
    if (approved) {
      revert AlreadyApproved();
    }
    if (msg.sender != approver) {
      revert ApproverOnly();
    }
    uint256 balance = IERC20(stableContract).balanceOf(address(this));
    if (balance < stableApproverFee) {
      revert InsufficientFunds();
    }
    IERC20(stableContract).transfer(msg.sender, stableApproverFee);
    PoolTemplate(_poolAddress).approvePool();
  }

  function setFeeValue(uint256 _fee) external onlyOwner {
    stableFeeValue = _fee;
  }

  function setStableContract(address _stableAddress) external onlyOwner {
    stableContract = _stableAddress;
  }

  function getWithdrawableBalance() external view onlyOwner returns (uint256) {
    return withdrawableBalance;
  }

  function findPoolsByParticipant(
    address _address,
    uint256 first,
    uint256 size
  ) external view returns (address[] memory list) {
    if (first > contractCount) {
      revert StartIndexGreaterThanItemsCount();
    }

    if (size > contractCount - first) {
      size = contractCount - first;
    }

    uint256 counter;
    list = new address[](0);
    for (uint256 i; i < contractCount; i++) {
      bool exist;
      try PoolTemplate(contracts[i]).hasParticipant(_address) returns (bool res) {
        exist = res;
      } catch {
        exist = false;
      }

      if (exist) {
        counter++;
        if (counter < first + 1) {
          continue;
        }

        address[] memory tempList = new address[](list.length + 1);
        for (uint t; t < list.length; t++) {
          tempList[t] = list[t];
        }
        tempList[tempList.length - 1] = contracts[i];

        list = new address[](tempList.length);
        for (uint t; t < tempList.length; t++) {
          list[t] = tempList[t];
        }

        if (list.length == size) {
          return list;
        }
      }
    }
  }

  function withdraw() external onlyOwner hasStableContract {
    if (withdrawableBalance == 0) {
      revert InsufficientFunds();
    }
    IERC20(stableContract).transfer(owner(), withdrawableBalance);
  }

  function _spendFee(uint256 _fee) private hasStableContract {
    uint256 balance = IERC20(stableContract).balanceOf(msg.sender);
    if (_fee > balance) {
      revert InsufficientFunds();
    }
    IERC20(stableContract).transferFrom(msg.sender, address(this), _fee);
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
    if (_isZeroAddress(stableContract)) {
      revert NoStableContract();
    }
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

  function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
