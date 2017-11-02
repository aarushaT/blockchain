pragma solidity ^0.4.2;

import "./ConvertLib.sol";

// This is just a simple example of a coin-like contract.
// It is not standards compatible and cannot be expected to talk to other
// coin/token contracts. If you want to create a standards-compliant
// token, see: https://github.com/ConsenSys/Tokens. Cheers!

contract MetaCoin {
    
    struct Account {
        uint balance;
    }
    
    address public admin;
    bool public lottery_end;

    mapping (address => Account) accounts;
    uint public ticket_amount = 200; //meta

    address[] PublicAccounts;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event CollectedFunds(address indexed _from);
    event LotteryEnded(uint amount_won);

    modifier only_admin() {
        require(msg.sender == admin);
        _;
    }

    function MetaCoin() {
        admin = tx.origin;
        accounts[admin].balance = 10000;
    }

    function sendCoin(address receiver, uint amount) returns(bool sufficient) {
        if (accounts[msg.sender].balance < amount) return false;
        accounts[msg.sender].balance -= amount;
        accounts[receiver].balance += amount;
        Transfer(msg.sender, receiver, amount);
        return true;
    }

    function getBalanceInEth(address addr) returns(uint) {
        return ConvertLib.convert(getBalance(addr), 2);
    }

    function getBalance(address addr) returns(uint) {
        return accounts[addr].balance;
    }

    function freeMoney(address addr) only_admin returns(uint) {        
        accounts[addr].balance += 1000;
        return accounts[addr].balance;
    }

    function getTicketPrice() returns(uint) {
        return ticket_amount;
    }

    function collectFunds(address participant) {
        require((participant != admin) && (accounts[participant].balance >= ticket_amount));
        accounts[participant].balance -= ticket_amount;
        accounts[admin].balance += ticket_amount;
        CollectedFunds(participant);
    }

    function addAddress(address member_address) {
        PublicAccounts.push(member_address);
        return PublicAccounts.length;
    }
}
