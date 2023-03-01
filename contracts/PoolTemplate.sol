// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PoolTemplate {
  struct Participant {
    address account;
    uint share;
    uint claimed;
    uint accrued;
    string description;
  }

  struct ParticipantData {
    uint share;
    uint claimed;
    string description;
  }

  bool private poolApproved = true;
  bool private poolPrivatable;
  address private poolApprover;
  address private poolAdmin;
  address private poolTokenAddress;
  address private poolFactory;
  string private poolName;
  string private poolTokenName;

  uint private poolParticipantsCount;
  uint private poolTokenAmount;
  uint private poolOverallClaimed;

  mapping(address => ParticipantData) private participantsData;
  mapping(uint => address) private mapper;

  modifier onlyAdmin() {
    require(msg.sender == poolAdmin, "Only for admin");
    _;
  }

  modifier onlyApproved() {
    require(poolApproved, "Pool is not approved");
    _;
  }

  modifier onlyParticipant() {
    require(participantsData[msg.sender].share > 0, "Only for participant");
    _;
  }

  modifier hasTokenAddress() {
    require(!_isZeroAddress(poolTokenAddress), "Token contract address no set");
    _;
  }

  modifier isContract(address _address) {
    require(_address.code.length != 0, "Address is not contract");
    _;
  }

  constructor(
    address _creator,
    string memory _name,
    address _tokenAddress,
    string memory _tokenName,
    Participant[] memory _participants,
    address _approver,
    bool _privatable
  ) {
    poolFactory = msg.sender;
    poolAdmin = _creator;
    poolName = _name;
    poolTokenName = _tokenName;
    poolPrivatable = _privatable;
    poolTokenAmount = _calculateTokenAmount(_participants);
    addParticipants(_participants);

    if (!_isZeroAddress(_tokenAddress)) {
      _setTokenAddress(_tokenAddress);
    }

    if (!_isZeroAddress(_approver)) {
      poolApprover = _approver;
      poolApproved = false;
    }
  }

  function changeAdmin(address _newAdmin) external onlyAdmin {
    require(!_isZeroAddress(_newAdmin), "Zero address do not allowed");
    poolAdmin = _newAdmin;
  }

  function addParticipants(Participant[] memory _participants) private {
    for (uint i; i < _participants.length; i++) {
      Participant memory item = _participants[i];
      require(item.share > 0, "Share value must be greater 0");
      participantsData[item.account] = ParticipantData(item.share, item.claimed, item.description);
      mapper[poolParticipantsCount] = item.account;
      poolParticipantsCount++;
    }
  }

  function getPoolData()
    external
    view
    onlyParticipant
    returns (
      address admin,
      string memory name,
      address tokenAddress,
      string memory tokenName,
      uint tokenAmount,
      uint filledAmount,
      uint participantsCount,
      address approver,
      bool approved,
      bool privatable
    )
  {
    uint overallBalance = !_isZeroAddress(poolTokenAddress) ? tokenBalance() : 0;
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

  function approvePool() external returns (bool) {
    require(!poolApproved, "Pool already approved");
    require(poolFactory == msg.sender, "Only for factory contract");
    poolApproved = true;
    return true;
  }

  function setTokenAddress(address _tokenAddress) external onlyAdmin {
    _setTokenAddress(_tokenAddress);
  }

  function tokenBalance() public view hasTokenAddress onlyParticipant returns (uint) {
    return IERC20(poolTokenAddress).balanceOf(address(this));
  }

  function claimTokens() external hasTokenAddress {
    ParticipantData memory data = participantsData[msg.sender];
    uint accrued = _calculateAccrued(data);
    require(accrued > 0, "There are not tokens for claim");
    participantsData[msg.sender].claimed += accrued;
    poolOverallClaimed += accrued;
    bool success = IERC20(poolTokenAddress).transfer(msg.sender, accrued);
    require(success, "Claim error");
  }

  function getParticipant() external view onlyParticipant returns (Participant memory) {
    ParticipantData memory data = participantsData[msg.sender];
    return
      Participant(msg.sender, data.share, data.claimed, _calculateAccrued(data), data.description);
  }

  function getParticipants(
    uint first,
    uint size
  ) external view onlyParticipant returns (Participant[] memory) {
    if (poolParticipantsCount == 0) {
      return new Participant[](0);
    }
    require(!poolPrivatable, "Forbidden for private pool");
    require(poolParticipantsCount > first, "Start index greater than count of participants");

    if (size > poolParticipantsCount - first) {
      size = poolParticipantsCount - first;
    }
    Participant[] memory participants = new Participant[](size);

    uint counter;

    for (uint i = first; i < first + size; i++) {
      ParticipantData memory data = participantsData[mapper[i]];

      participants[counter] = Participant(
        mapper[i],
        data.share,
        data.claimed,
        _calculateAccrued(data),
        data.description
      );
      counter++;
    }

    return participants;
  }

  function _setTokenAddress(address _tokenAddress) private isContract(_tokenAddress) onlyApproved {
    require(_isZeroAddress(poolTokenAddress), "Token address already set");
    poolTokenAddress = _tokenAddress;
  }

  function _calculateAccrued(ParticipantData memory data) private view returns (uint) {
    uint overallBalance = !_isZeroAddress(poolTokenAddress) ? tokenBalance() : 0;
    return ((overallBalance + poolOverallClaimed) * data.share) / poolTokenAmount - data.claimed;
  }

  function _calculateTokenAmount(
    Participant[] memory _participants
  ) private pure returns (uint sum) {
    for (uint i; i < _participants.length; i++) {
      sum += _participants[i].share;
    }
  }

  function _isZeroAddress(address _address) private pure returns (bool) {
    return _address == address(0);
  }
}
