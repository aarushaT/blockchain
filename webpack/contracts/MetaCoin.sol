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

    address public admin; //admin's address
    bool public lottery_end; //has the lottery ended? 
    bool public lottery_won; //did we win the lottery? 

    mapping (address => Account) accounts;


    uint public ticket_amount = 200; //meta
    uint public number_participants; //number participants in the pool
    //uint random_number = uint(block.blockhash(block.number-1))%10 + 1 //random number for lottery

    address [] PublicAccounts; 

    //Smart contract events
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event CollectedFunds(address indexed _from); //collect money from 
   // event LotteryEnded(uint amount_won);
    event DistributeFunds(address winner, uint winnings); //distribute winnings if the lottery has been won

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

    function setParticipants(uint num) only_admin returns (uint){

        number_participants = num;  
        return number_participants; 
    }


    function collectFunds() only_admin {

      address participant = 0xe37dc14a4b4b79497363a67aafad622a2c48dc2b; 

      for (uint i=0; i<number_participants; i++)  {

        require((participant != admin) && (accounts[participant].balance >= ticket_amount));
        accounts[participant].balance -= ticket_amount;
        accounts[admin].balance += ticket_amount;
        CollectedFunds(participant);
        lottery_end = true; 
        }

    }


    // function lotteryNumbers(){

    //         uint random_number = uint(block.blockhash(block.number-1))%10 + 1;
    //         var x = random_number; 

    //             if (x<5)
    //                 lottery_won = false;
    //                 lottery_end = false; //if lottery is not won, lottery will continue to accept funds       
    //             else 
    //                 lottery_won = true; 
    // }

    // function checkLottery(){

    //     if (lottery_end && lottery_won)
    //     //we could write some code code to 
    //     //check how much we should distribute to the 
    //     //participants 
    //     var winnings = 300; 
    //     //loop through participants

    //     DistributeFunds(, winnings); 
    // }
} 





