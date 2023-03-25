// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
//import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

struct PoolData {
  bytes32 name;
  bytes32 tokenName;
  address tokenAddress;
  address approver;
  bool privatable;
  bool finalized;
}

struct ParticipantView {
  address account;
  uint256 share;
  uint256 claimed;
  uint256 accrued;
}

error OnlyAdmin();
error OnlyParticipant();
error OnlyFactory();
error OnlyFinalized();
error OnlyApproved();
error OnlyForPublicPool();
error NoZeroAddress();
error LengthsNotMatched();
error MustBeGreaterZero();
error NotUniq();
error AlreadyApproved();
error NoTokenContract();
error NoTokensForClaim();
error StartIndexGreaterThanItemsCount();
error AlreadyFinalized();
error TokenAddressAlreadySet();
error AddressNotContract();

contract PoolTemplate is Initializable {
  bool public finalized;

  bool private poolApproved;
  bool private poolPrivatable;
  address private poolApprover;
  address private poolAdmin;
  address private poolTokenAddress;
  address private poolFactory;
  bytes32 private poolName;
  bytes32 private poolTokenName;

  uint256 private poolParticipantsCount;
  uint256 private poolTokenAmount;
  uint256 private poolOverallClaimed;

  mapping(address => uint256) private participants; // Participant -> share
  mapping(address => uint256) private participantsClaims; // Participant -> claimed
  mapping(uint256 => address) private participantsMapper;

  modifier onlyAdmin() {
    _onlyAdmin();
    _;
  }

  modifier onlyParticipant() {
    _onlyParticipant();
    _;
  }

  modifier onlyFactory() {
    _onlyFactory();
    _;
  }

  modifier onlyFinalized() {
    _onlyFinalized();
    _;
  }

  modifier onlyNoFinalized() {
    _checkFinalizing();
    _;
  }

  function init(address _creator, PoolData calldata data) external initializer {
    poolFactory = msg.sender;
    poolAdmin = _creator;
    poolName = data.name;
    poolTokenName = data.tokenName;
    poolPrivatable = data.privatable;

    if (!_isZeroAddress(data.tokenAddress)) {
      _setTokenAddress(data.tokenAddress);
    }

    if (!_isZeroAddress(data.approver)) {
      poolApprover = data.approver;
    } else {
      poolApproved = true;
    }
  }

  function changeAdmin(address _newAdmin) external onlyAdmin {
    if (_isZeroAddress(_newAdmin)) {
      revert NoZeroAddress();
    }

    poolAdmin = _newAdmin;
  }

  function finalize() external onlyFactory onlyNoFinalized {
    finalized = true;
  }

  function addParticipants(
    address[] calldata _participants,
    uint256[] calldata _shares
  ) external onlyFactory onlyNoFinalized {
    uint256 sum;
    uint length = _participants.length;
    if (length != _shares.length) {
      revert LengthsNotMatched();
    }

    uint tempPoolParticipantsCount = poolParticipantsCount;
    for (uint256 i; i < length; ) {
      address p = _participants[i];
      uint s = _shares[i];

      if (s == 0) {
        revert MustBeGreaterZero();
      }

      if (participants[p] != 0) {
        revert NotUniq();
      }
      participants[p] = s;
      participantsMapper[tempPoolParticipantsCount] = p;

      unchecked {
        tempPoolParticipantsCount++;
        sum += s;
        ++i;
      }
    }
    poolTokenAmount = sum;
    poolParticipantsCount = tempPoolParticipantsCount;
  }

  function getPoolData()
    external
    view
    onlyParticipant
    returns (
      address admin,
      bytes32 name,
      address tokenAddress,
      bytes32 tokenName,
      uint256 tokenAmount,
      uint256 filledAmount,
      uint256 participantsCount,
      address approver,
      bool approved,
      bool privatable
    )
  {
    uint256 overallBalance = tokenBalance();
    return (
      poolAdmin,
      poolName,
      poolTokenAddress,
      poolTokenName,
      poolTokenAmount,
      overallBalance + poolOverallClaimed,
      poolParticipantsCount,
      poolApprover,
      poolApproved,
      poolPrivatable
    );
  }

  function approvePool() external onlyFactory onlyFinalized returns (bool) {
    if (poolApproved) {
      revert AlreadyApproved();
    }
    poolApproved = true;
    return true;
  }

  function setTokenAddress(address _tokenAddress) external onlyAdmin onlyFinalized {
    _setTokenAddress(_tokenAddress);
  }

  function tokenBalance() public view onlyParticipant returns (uint256) {
    return
      !_isZeroAddress(poolTokenAddress) ? IERC20(poolTokenAddress).balanceOf(address(this)) : 0;
  }

  function claimTokens() external onlyFinalized {
    if (_isZeroAddress(poolTokenAddress)) {
      revert NoTokenContract();
    }

    uint256 accrued = _calculateAccrued(msg.sender);
    if (accrued == 0) {
      revert NoTokensForClaim();
    }
    participantsClaims[msg.sender] += accrued;
    poolOverallClaimed += accrued;
    IERC20(poolTokenAddress).transfer(msg.sender, accrued);
  }

  function getApprovalData()
    external
    view
    onlyFactory
    returns (bool approved, address approver, address creator)
  {
    return (poolApproved, poolApprover, poolAdmin);
  }

  function getParticipant() external view onlyParticipant returns (ParticipantView memory) {
    return
      ParticipantView(
        msg.sender,
        participants[msg.sender],
        participantsClaims[msg.sender],
        _calculateAccrued(msg.sender)
      );
  }

  function hasParticipant(address _address) external view onlyFactory returns (bool) {
    return participants[_address] != 0;
  }

  function getParticipants(
    uint256 first,
    uint256 size
  ) external view onlyParticipant returns (ParticipantView[] memory pList) {
    if (poolParticipantsCount == 0) {
      return new ParticipantView[](0);
    }
    if (poolPrivatable) {
      revert OnlyForPublicPool();
    }
    if (first > poolParticipantsCount) {
      revert StartIndexGreaterThanItemsCount();
    }
    if (size > poolParticipantsCount - first) {
      size = poolParticipantsCount - first;
    }

    pList = new ParticipantView[](size);
    uint256 counter;
    for (uint256 i = first; i < first + size; ) {
      pList[counter] = ParticipantView(
        participantsMapper[i],
        participants[participantsMapper[i]],
        participantsClaims[participantsMapper[i]],
        _calculateAccrued(participantsMapper[i])
      );
      unchecked {
        i++;
        counter++;
      }
    }
  }

  function _setTokenAddress(address _tokenAddress) private {
    if (!poolApproved) {
      revert OnlyApproved();
    }
    if (!_isZeroAddress(poolTokenAddress)) {
      revert TokenAddressAlreadySet();
    }
    if (_tokenAddress.code.length == 0) {
      revert AddressNotContract();
    }
    poolTokenAddress = _tokenAddress;
  }

  function _calculateAccrued(address _address) private view returns (uint256) {
    uint256 overallBalance = tokenBalance();
    return
      ((overallBalance + poolOverallClaimed) * participants[_address]) /
      poolTokenAmount -
      participantsClaims[_address];
  }

  function _isZeroAddress(address _address) private pure returns (bool) {
    return _address == address(0);
  }

  function _onlyAdmin() private view {
    if (msg.sender != poolAdmin) {
      revert OnlyAdmin();
    }
  }

  function _onlyParticipant() private view {
    if (participants[msg.sender] == 0) {
      revert OnlyParticipant();
    }
  }

  function _onlyFactory() private view {
    if (poolFactory != msg.sender) {
      revert OnlyFactory();
    }
  }

  function _onlyFinalized() private view {
    if (!finalized) {
      revert OnlyFinalized();
    }
  }

  function _checkFinalizing() private view {
    if (finalized) {
      revert AlreadyFinalized();
    }
  }
}
