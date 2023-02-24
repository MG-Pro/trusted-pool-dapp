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
  address private poolCreator;
  address private poolTokenAddress;
  string private poolName;
  string private poolTokenName;

  uint private poolParticipantsCount;
  uint private poolTokenAmount;
  uint private poolOverallClaimed;

  mapping(address => ParticipantData) private participantsData;
  mapping(uint => address) private mapper;

  modifier onlyCreator() {
    require(msg.sender == poolCreator, "Only for creator");
    _;
  }

  modifier onlyApproved() {
    require(poolApprover != address(0) && msg.sender == poolApprover, "Only for approver");
    _;
  }

  modifier onlyParticipant() {
    require(participantsData[msg.sender].share > 0, "Only for participant");
    _;
  }

  modifier hasTokenAddress() {
    require(poolTokenAddress != address(0), "Token contract address no set");
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
    poolCreator = _creator;
    poolName = _name;
    poolTokenName = _tokenName;
    poolPrivatable = _privatable;
    poolTokenAmount = _calculateTokenAmount(_participants);
    addParticipants(_participants);

    if (_tokenAddress != address(0)) {
      _setTokenAddress(_tokenAddress);
    }

    if (_approver != address(0)) {
      poolApprover == _approver;
      poolApproved = false;
    }
  }

  function addParticipants(Participant[] memory _participants) private {
    for (uint i; i < _participants.length; i++) {
      Participant memory item = _participants[i];
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
      address creator,
      string memory name,
      address tokenAddress,
      string memory tokenName,
      uint tokenAmount,
      uint filledAmount,
      uint participantsCount,
      bool approved,
      bool privatable
    )
  {
    uint overallBalance = poolTokenAddress != address(0) ? tokenBalance() : 0;
    return (
      poolCreator,
      poolName,
      poolTokenAddress,
      poolTokenName,
      poolTokenAmount,
      overallBalance + poolOverallClaimed,
      poolParticipantsCount,
      poolApproved,
      poolPrivatable
    );
  }

  function approvalData() external view returns (bool approved, address approver) {
    return (poolApproved, poolApprover);
  }

  function approvePool() external {
    require(poolApprover != address(0) && msg.sender == poolApprover, "Only for approver");
    poolApproved = true;
  }

  function setTokenAddress(address _tokenAddress) external onlyCreator onlyApproved {
    _setTokenAddress(_tokenAddress);
  }

  function tokenBalance() public view hasTokenAddress onlyParticipant returns (uint) {
    return IERC20(poolTokenAddress).balanceOf(address(this));
  }

  function claimTokens() external hasTokenAddress onlyApproved {
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
    require(!poolPrivatable, "Forbidden fo private pool");
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

  function _setTokenAddress(address _tokenAddress) private isContract(_tokenAddress) {
    require(poolTokenAddress == address(0), "Token address already set");
    poolTokenAddress = _tokenAddress;
  }

  function _calculateAccrued(ParticipantData memory data) private view returns (uint) {
    uint overallBalance = poolTokenAddress != address(0) ? tokenBalance() : 0;
    return ((overallBalance + poolOverallClaimed) * data.share) / poolTokenAmount - data.claimed;
  }

  function _calculateTokenAmount(
    Participant[] memory _participants
  ) private pure returns (uint sum) {
    for (uint i; i < _participants.length; i++) {
      sum += _participants[i].share;
    }
  }
}
