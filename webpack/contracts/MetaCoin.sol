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
    }
    
    address public admin;
    bool public lottery_end;

    mapping (address => Account) public accounts;
    mapping (string => address) emails;
    uint max_members;
    uint public ticket_amount = 2; //meta
    uint initialAccountBalance;
    uint public winnings = 200; 


    address[] public members;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event CollectedFunds(address indexed _from);
    event DistributedFunds(address indexed _to); 
    //event LotteryEnded(uint amount_won);
    event LotteryWon(bool won);

    modifier only_admin() {
        require(msg.sender == admin);
        _;
    }

    function MetaCoin() {
        admin = tx.origin;
        accounts[admin].balance = 0;
        initialAccountBalance = 20; 
        accounts[admin].name = "Administrator";
        max_members = 10;
    }

    function sendCoin(address receiver, uint amount) returns(bool sufficient) {
        if (accounts[msg.sender].balance < amount) return false;
        accounts[msg.sender].balance -= amount;
        accounts[receiver].balance += amount;
        Transfer(msg.sender, receiver, amount);
        return true;
    }

    function getBalanceInEth(address addr) returns(uint) {
        return 2;// ConvertLib.convert(getBalance(addr), 2);
    }

    function getBalance(string member_email) returns(uint) {
        var member_address = emails[member_email]; 
        return accounts[member_address].balance; 
    }

    function withdrawFunds (string member_email, uint amount) returns (uint){
        var member_address = emails[member_email]; 
        
         accounts[member_address].balance -= amount; 

        return accounts [member_address].balance; 
    }

    function freeMoney(address addr) only_admin returns(uint) {        
        accounts[addr].balance += 1000;
        return accounts[addr].balance;
    }

    function getTicketPrice() returns(uint) {
        return ticket_amount;
    }

    function collectFunds() only_admin{
        require (members.length > 0); 
        for(uint i = 0; i < members.length; i++) {
            accounts[members[i]].balance -= ticket_amount;
            CollectedFunds(members[i]);
        }
          
    }
   
    function distributeFunds () only_admin {
         //require (members.length > 0); 
        for(uint i = 0; i < members.length; i++) {
            accounts[members[i]].balance += 200;
            DistributedFunds(members[i]);
        }
    }

    function setLotterynumber(uint lottery_number) returns (uint){
        return lottery_number; 
    }

   
    function getWinnings() returns (uint){
        var prize = initialAccountBalance*members.length; 
        return winnings; 
    }

    function addMember(address member_address, string member_name) only_admin returns(bool) {
        if (members.length < max_members) {
            members.push(member_address);
            accounts[member_address].balance = initialAccountBalance;
            accounts[member_address].name = member_name;
            //mapping hash to member email
            emails[member_name] = member_address;  

            return true;
        }
        return false;
    }

    function getMemberCount() only_admin returns(uint) {
        return members.length;
    }

    function getMemberAddresses() only_admin returns(address[]) {
        return members;
    }

    function getAccount(address member_address) only_admin returns(string, uint) {
        return (accounts[member_address].name, accounts[member_address].balance);
    }

     function getAddress (string member_email) only_admin returns (address){
        return emails[member_email]; 
    }

     function checkNumbers(uint winning_number, uint number) returns(bool){
        if (winning_number == number) {
            //distributeFunds(); 
            LotteryWon(true);
            return true;
        }
        //collectFunds();
        return false;
         
    }

}

