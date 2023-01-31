// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract PooledTemplate {
  enum Statuses {
    Active,
    Finished
  }

  struct Participant {
    address account;
    uint256 share;
    uint256 claimed;
    string description;
  }

  struct ParticipantData {
    uint256 share;
    uint256 claimed;
    string description;
  }

  address public creator;
  string private name;
  address private tokenAddress;
  string private tokenName;
  Statuses public status;
  uint256 private participantsCount;

  mapping(address => ParticipantData) private participantsData;
  mapping(uint256 => address) private mapper;

  modifier onlyCreator() {
    require(msg.sender == creator, "Only for creator");
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
    addParticipants(_participants);
  }

  function addParticipants(Participant[] memory _participants) internal {
    for (uint256 i; i < _participants.length; i++) {
      Participant memory item = _participants[i];
      participantsData[item.account] = ParticipantData(item.share, 0, item.description);
      mapper[participantsCount] = item.account;
      participantsCount++;
    }
  }

  function getData()
    external
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
    _participants = new Participant[](participantsCount);

    for (uint256 i = 0; i < participantsCount; i++) {
      ParticipantData memory itemData = participantsData[mapper[i]];
      Participant memory item = Participant(
        mapper[i],
        itemData.share,
        itemData.claimed,
        itemData.description
      );
      _participants[i] = item;
    }

    return (creator, name, tokenAddress, tokenName, status, _participants);
  }
}
