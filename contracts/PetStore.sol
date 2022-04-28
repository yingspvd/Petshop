pragma solidity ^0.5.0;

contract PetStore {
   address payable public owner;
    mapping(address => uint256) public payment;

    constructor() public {
        owner = msg.sender;
    }

    function payPet(uint256 _amount) public payable {
        require(msg.value == _amount && msg.value > 0);
        payment[msg.sender] += msg.value;
        owner.transfer(msg.value);
    }

    function getMoney() public view returns (uint256) {
        uint256 balance = address(this).balance;
        return balance;
    }

}

