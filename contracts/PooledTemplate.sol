// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PooledTemplate {
  enum Statuses {
    Active,
    Finished
  }

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
    uint ratio;
    uint accrued;
    string description;
  }

  address private poolCreator;
  string private poolName;
  address private poolTokenAddress;
  string private poolTokenName;
  Statuses private poolStatus;

  uint private participantsCount;
  uint private distributedBalance;
  uint private poolTokenAmount;

  mapping(address => ParticipantData) private participantsData;
  mapping(uint256 => address) private mapper;

  modifier onlyCreator() {
    require(msg.sender == poolCreator, "Only for creator");
    _;
  }

  modifier onlyParticipant() {
    require(participantsData[msg.sender].share > 0, "Only for participant");
    _;
  }

  modifier hasTokenAddress() {
    require(poolTokenAddress == address(0), "Token contract address no set");
    _;
  }

  modifier atStatus(Statuses _status) {
    require(poolStatus == _status, "Wrong status");
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

  function addParticipants(Participant[] memory _participants) internal {
    for (uint256 i; i < _participants.length; i++) {
      Participant memory item = _participants[i];
      // TODO: CHECK IT!
      uint ratio = (item.share * 100) / poolTokenAmount;

      participantsData[item.account] = ParticipantData(
        item.share,
        item.claimed,
        ratio,
        item.accrued,
        item.description
      );
      mapper[participantsCount] = item.account;
      participantsCount++;
    }
  }

  function getData()
    public
    view
    returns (
      address creator,
      string memory name,
      address tokenAddress,
      string memory tokenName,
      Statuses status,
      Participant[] memory participants
    )
  {
    return (creator, name, tokenAddress, tokenName, status, getParticipants());
  }

  function setTokenAddress(address _tokenAddress) external onlyParticipant {
    require(isContract(_tokenAddress), "Argument is not contract address");
    poolTokenAddress = _tokenAddress;
  }

  function tokenBalance() public view hasTokenAddress returns (uint256) {
    return ERC20(poolTokenAddress).balanceOf(address(this));
  }

  function tokenDistribution() public {
    uint balance = tokenBalance();
    require(balance > distributedBalance, "There are not tokens for distribution");

    uint undistributedBalance = balance - distributedBalance;
    Participant[] memory _participants = getParticipants();

    for (uint i = 0; i < _participants.length; i++) {
      ParticipantData memory item = participantsData[_participants[i].account];
      participantsData[_participants[i].account].accrued =
        (undistributedBalance * item.ratio) /
        100;
    }
    distributedBalance = balance;
  }

  function claimTokens() external hasTokenAddress {
    require(participantsData[msg.sender].accrued > 0, "There are not tokens for claim");
    uint accrued = participantsData[msg.sender].accrued;
    participantsData[msg.sender].claimed += accrued;
    participantsData[msg.sender].accrued = 0;

    bool success = ERC20(poolTokenAddress).transfer(address(this), accrued);
    require(success, "Claim error");
  }

  function getParticipants() private view returns (Participant[] memory) {
    Participant[] memory participants = new Participant[](participantsCount);
    for (uint i = 0; i < participantsCount; i++) {
      ParticipantData memory data = participantsData[mapper[i]];
      participants[i] = Participant(
        mapper[i],
        data.share,
        data.claimed,
        data.accrued,
        data.description
      );
    }

    return participants;
  }

  function calculateTokenAmount(
    Participant[] memory _participants
  ) private pure returns (uint sum) {
    for (uint256 i; i < _participants.length; i++) {
      sum += _participants[i].share;
    }
  }

  function isContract(address _addr) private view returns (bool) {
    uint32 size;
    assembly {
      size := extcodesize(_addr)
    }
    return (size > 0);
  }
}
