pragma solidity ^0.5.0;

contract Donation {
    address payable public owner;
    mapping(address => uint256) public donations;

    constructor() public {
        owner = msg.sender;
    }

    function donate(uint256 _amount) public payable {
        require(msg.value == _amount && msg.value > 0);
        donations[msg.sender] += msg.value;
    }

    function getDonations() public view returns (uint256) {
        return donations[msg.sender];
    }

    function getTotalDonations() public view returns (uint256) {
        uint256 balance = address(this).balance;
        return balance;
    }

    function claimDonate() public payable {
        require(msg.sender == owner);
        msg.sender.transfer(getTotalDonations());
    }
}