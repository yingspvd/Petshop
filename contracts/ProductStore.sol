pragma solidity ^0.5.0;

contract ProductStore {
    address public owner;
    mapping(address => uint256) public payment;

    constructor() public {
        owner = msg.sender;
    }

    function payProduct(uint256 _amount) public payable {
        require(msg.value == _amount && msg.value > 0);
        payment[msg.sender] += msg.value;
    }

    // function claimDonate() public payable {
    //     require(msg.sender == owner);
    //     msg.sender.transfer(getTotalDonations());
    // }
}