pragma solidity ^0.5.0;

contract Donation {
    address payable public owner;
    uint256 public totalDonate;
    mapping(address => uint256) public donations;
    mapping(address => uint256) public amounts;
   
    constructor() public payable{
        owner = msg.sender;
        amounts[owner] = msg.value;
    }

    function checkOwner() public view returns(bool){
        require(msg.sender == owner);
        return true;
    }

    function donate(uint256 _amount) public payable {
        require(msg.value == _amount && msg.value > 0);
        donations[msg.sender] += msg.value;
        totalDonate += msg.value;
    }

    function getDonations() public view returns (uint256) {
        return donations[msg.sender];
    }

    function getTotalDonations() public view returns (uint256) {
        return totalDonate;
    }

    function getMonthlyDonation() public view returns (uint256) {
        uint256 balance = address(this).balance;
        return balance;
    }

    function claimDonate() public payable returns(bool){
        require(msg.sender == owner, "You don't have permission to access");
        uint256 balance = address(this).balance;
        msg.sender.transfer(balance);
        return true;
    
    }
}