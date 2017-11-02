pragma solidity ^0.4.2;

import "./ConvertLib.sol";

// This is just a simple example of a coin-like contract.
// It is not standards compatible and cannot be expected to talk to other
// coin/token contracts. If you want to create a standards-compliant
// token, see: https://github.com/ConsenSys/Tokens. Cheers!

contract MetaCoin {
    
    struct Account {
        string name;
        uint balance;
        bool exists;
    }
    
    address public admin;
    bool public lottery_end;

    mapping (address => Account) accounts;
    uint public ticket_amount = 200; //meta
    uint initialAccountBalance;

    address[] members;

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
        initialAccountBalance = 1000;
        accounts[admin].name = "Administrator";
        accounts[admin].exists = true;
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

    function collectFunds(address participant) only_admin {
        //require((participant != admin) && (accounts[participant].balance >= ticket_amount));
        accounts[participant].balance -= ticket_amount;
        accounts[admin].balance += ticket_amount;
        CollectedFunds(participant);
    }

    function addMember(address member_address, string member_name) returns(bool) {
        if (isUnique(member_address)) {
            members.push(member_address);
            accounts[member_address].balance = initialAccountBalance;
            accounts[member_address].name = member_name;
            accounts[member_address].exists = true;
            return true;
        }
        return false;
    }

    function isUnique(address addr) internal returns(bool) {
        if (!accounts[addr].exists) {
            return true;
        }
        return false;
    }

    function getParticipantCount() returns(uint) {
        return members.length;
    }
}
