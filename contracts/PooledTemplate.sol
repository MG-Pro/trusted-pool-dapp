// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PooledTemplate {
  enum Statuses {
    Active,
    Finished
  }

  struct Participant {
    address account;
    uint256 share;
    uint256 claimed;
    uint256 accrued;
    string description;
  }

  struct ParticipantData {
    uint256 share;
    uint256 claimed;
    uint256 accrued;
    string description;
  }

  address private poolOrganizer;
  address private poolCreator;
  address private poolTokenAddress;
  string private poolName;
  string private poolTokenName;

  uint256 private participantsCount;
  uint256 private poolTokenAmount;
  Statuses private poolStatus;

  mapping(address => ParticipantData) private participantsData;
  mapping(uint256 => address) private mapper;

  modifier onlyCreator() {
    require(msg.sender == poolCreator, "Only for creator1");
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

  modifier atStatus(Statuses _status) {
    require(poolStatus == _status, "Wrong status");
    _;
  }

  modifier isContract(address _address) {
    require(_address.code.length != 0, "Argument is not contract address");
    _;
  }

  constructor(
    address _creator,
    string memory _name,
    address _tokenAddress,
    string memory _tokenName,
    Participant[] memory _participants
  ) {
    poolCreator = _creator;
    poolName = _name;
    poolTokenAddress = _tokenAddress;
    poolTokenName = _tokenName;
    poolStatus = Statuses.Active;
    poolTokenAmount = calculateTokenAmount(_participants);
    addParticipants(_participants);
  }

  function addParticipants(Participant[] memory _participants) private {
    for (uint256 i; i < _participants.length; i++) {
      Participant memory item = _participants[i];
      participantsData[item.account] = ParticipantData(
        item.share,
        item.claimed,
        item.accrued,
        item.description
      );
      mapper[participantsCount] = item.account;
      participantsCount++;
    }
  }

  function getPoolData(
    uint256 first,
    uint256 size
  )
    external
    view
    onlyParticipant
    returns (
      address creator,
      string memory name,
      address tokenAddress,
      string memory tokenName,
      uint256 tokenAmount,
      Statuses status,
      Participant[] memory participants
    )
  {
    require(participantsCount > first, '"first" greater than count of participants');
    if (size > participantsCount) {
      size = participantsCount;
    }

    return (
      poolCreator,
      poolName,
      poolTokenAddress,
      poolTokenName,
      poolTokenAmount,
      poolStatus,
      getParticipants(first, size)
    );
  }

  function setTokenAddress(
    address _tokenAddress
  ) external onlyParticipant isContract(_tokenAddress) {
    require(poolTokenAddress == address(0), "Token address already set");
    poolTokenAddress = _tokenAddress;
  }

  function tokenBalance() public view hasTokenAddress onlyParticipant returns (uint256) {
    return IERC20(poolTokenAddress).balanceOf(address(this));
  }

  function claimTokens() external hasTokenAddress {
    require(participantsData[msg.sender].accrued > 0, "There are not tokens for claim");
    uint256 accrued = participantsData[msg.sender].accrued;
    participantsData[msg.sender].claimed += accrued;
    participantsData[msg.sender].accrued = 0;

    bool success = IERC20(poolTokenAddress).transfer(address(this), accrued);
    require(success, "Claim error");
  }

  function getParticipants(
    uint256 first,
    uint256 size
  ) private view returns (Participant[] memory) {
    if (participantsCount == 0) {
      return new Participant[](0);
    }

    uint256 overallBalance = poolTokenAddress != address(0) ? tokenBalance() : 0;
    Participant[] memory participants = new Participant[](size);

    for (uint256 i = first; i < size; i++) {
      ParticipantData memory data = participantsData[mapper[i]];
      uint256 accrued = (overallBalance * data.share) / poolTokenAmount - data.claimed;

      participants[i] = Participant(mapper[i], data.share, data.claimed, accrued, data.description);
    }

    return participants;
  }

  function calculateTokenAmount(
    Participant[] memory _participants
  ) private pure returns (uint256 sum) {
    for (uint256 i; i < _participants.length; i++) {
      sum += _participants[i].share;
    }
  }
}
