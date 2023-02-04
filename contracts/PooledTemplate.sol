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

  address public creator;
  string private name;
  address private tokenAddress;
  string private tokenName;
  Statuses public status;
  uint private participantsCount;
  uint private distributedBalance;
  uint private tokenAmount;

  mapping(address => ParticipantData) private participantsData;
  mapping(uint256 => address) private mapper;

  modifier onlyCreator() {
    require(msg.sender == creator, "Only for creator");
    _;
  }

  modifier onlyParticipant() {
    require(participantsData[msg.sender].share > 0, "Only for participant");
    _;
  }

  modifier atStatus(Statuses _status) {
    require(status == _status, "Wrong status");
    _;
  }

  constructor(
    address _creator,
    string memory _name,
    address _tokenAddress,
    string memory _tokenName,
    Participant[] memory _participants
  ) {
    creator = _creator;
    name = _name;
    tokenAddress = _tokenAddress;
    tokenName = _tokenName;
    status = Statuses.Active;
    tokenAmount = calculateTokenAmount(_participants);
    addParticipants(_participants);
  }

  function addParticipants(Participant[] memory _participants) internal {
    for (uint256 i; i < _participants.length; i++) {
      Participant memory item = _participants[i];
      // TODO: CHECK IT!
      uint ratio = (item.share * 100) / tokenAmount;

      participantsData[item.account] = ParticipantData(item.share, 0, 0, ratio, item.description);
      mapper[participantsCount] = item.account;
      participantsCount++;
    }
  }

  function getData()
    public
    view
    returns (
      address _creator,
      string memory _name,
      address _tokenAddress,
      string memory _tokenName,
      Statuses _status,
      Participant[] memory _participants
    )
  {
    return (creator, name, tokenAddress, tokenName, status, getParticipants());
  }

  function setTokenAddress(address _tokenAddress) external onlyParticipant {
    require(isContract(_tokenAddress), "Argument is not contract address");
    tokenAddress = _tokenAddress;
  }

  function tokenBalance() public view returns (uint256) {
    require(tokenAddress == address(0), "Token contract address no set");
    return ERC20(tokenAddress).balanceOf(address(this));
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

  function getParticipants() private view returns (Participant[] memory _participants) {
    for (uint i = 0; i < participantsCount; i++) {
      ParticipantData memory itemData = participantsData[mapper[i]];
      Participant memory item = Participant(
        mapper[i],
        itemData.share,
        itemData.claimed,
        itemData.accrued,
        itemData.description
      );
      _participants[i] = item;
    }
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
