// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

contract PoolTemplate is Initializable {
  struct Participant {
    address account;
    uint256 share;
    uint256 claimed;
    uint256 accrued;
  }

  error OnlyAdmin();
  error OnlyParticipant();
  error OnlyFactory();

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

  function init(
    address _creator,
    bytes32 _name,
    address _tokenAddress,
    bytes32 _tokenName,
    address _approver,
    bool _privatable
  ) external initializer {
    poolFactory = msg.sender;
    poolAdmin = _creator;
    poolName = _name;
    poolTokenName = _tokenName;
    poolPrivatable = _privatable;

    if (!_isZeroAddress(_tokenAddress)) {
      _setTokenAddress(_tokenAddress);
    }

    if (!_isZeroAddress(_approver)) {
      poolApprover = _approver;
    } else {
      poolApproved = true;
    }
  }

  function changeAdmin(address _newAdmin) external onlyAdmin {
    require(!_isZeroAddress(_newAdmin), "Zero address do not allowed");
    poolAdmin = _newAdmin;
  }

  function addParticipants(Participant[] calldata _participants) external onlyFactory {
    uint256 sum;
    for (uint256 i; i < _participants.length; i++) {
      Participant memory item = _participants[i];
      require(item.share > 0, "Share value must be greater 0");
      participants[item.account] = item.share;
      participantsMapper[poolParticipantsCount] = item.account;

      unchecked {
        poolParticipantsCount++;
        sum += _participants[i].share;
      }
    }
    poolTokenAmount = sum;
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

  function approvalData() external view returns (bool approved, address approver) {
    return (poolApproved, poolApprover);
  }

  function approvePool() external onlyFactory returns (bool) {
    require(!poolApproved, "Pool already approved");
    poolApproved = true;
    return true;
  }

  function setTokenAddress(address _tokenAddress) external onlyAdmin {
    _setTokenAddress(_tokenAddress);
  }

  function tokenBalance() public view onlyParticipant returns (uint256) {
    return
      !_isZeroAddress(poolTokenAddress) ? IERC20(poolTokenAddress).balanceOf(address(this)) : 0;
  }

  function claimTokens() external {
    require(!_isZeroAddress(poolTokenAddress), "Token contract address no set");
    uint256 accrued = _calculateAccrued(msg.sender);
    require(accrued > 0, "There are not tokens for claim");
    participantsClaims[msg.sender] += accrued;
    poolOverallClaimed += accrued;
    bool success = IERC20(poolTokenAddress).transfer(msg.sender, accrued);
    require(success, "Claim error");
  }

  function getParticipant() external view onlyParticipant returns (Participant memory) {
    return
      Participant(
        msg.sender,
        participants[msg.sender],
        participantsClaims[msg.sender],
        _calculateAccrued(msg.sender)
      );
  }

  function hasParticipant(address _address) external view onlyFactory returns (bool) {
    return participants[_address] > 0;
  }

  function getParticipants(
    uint256 first,
    uint256 size
  ) external view onlyParticipant returns (Participant[] memory) {
    if (poolParticipantsCount == 0) {
      return new Participant[](0);
    }
    require(!poolPrivatable, "Forbidden for private pool");
    require(poolParticipantsCount > first, "Start index greater than count of participants");

    if (size > poolParticipantsCount - first) {
      size = poolParticipantsCount - first;
    }
    Participant[] memory pList = new Participant[](size);

    uint256 counter;
    for (uint256 i = first; i < first + size; i++) {
      pList[counter] = Participant(
        participantsMapper[i],
        participants[participantsMapper[i]],
        participantsClaims[participantsMapper[i]],
        _calculateAccrued(participantsMapper[i])
      );
      unchecked {
        counter++;
      }
    }

    return pList;
  }

  function _setTokenAddress(address _tokenAddress) private {
    require(poolApproved, "Pool is not approved");
    require(_isZeroAddress(poolTokenAddress), "Token address already set");
    require(_tokenAddress.code.length != 0, "Address is not contract");
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
}
