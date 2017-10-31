// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3 } from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import metacoin_artifacts from '../../build/contracts/MetaCoin.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
var MetaCoin = contract(metacoin_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var admin_account;

// Hard-coded member names. The first member owns contracts by default (hence Admin).
var member_names = ['Admin', 'Emma', 'Aarusha', 'Andrew', 'Mark', 'Tanvir', 'Tuan', 'Luke', 'Alice', 'Bob'];
// Associative array to link names to account hashes
var account_hashes = {};

window.createMemberDropdowns = function(member_list) {
    var $option;

    for(var i=0; i < member_list.length; i++) {
        $option = $("<option>", { "value": account_hashes[member_list[i]].toString() }).text(member_list[i]);
        $(".member_select").append($option);
    }
}

window.setStatus = function(message) {
    var status = document.getElementById("status");
    status.innerHTML = "Status: " + message;
}

window.refreshAdminBalance = function() {
    var meta;
    MetaCoin.deployed().then(function(instance) {
        meta = instance;
        return meta.getBalance.call(admin_account, { from: admin_account });
    }).then(function(value) {
        var balance_element = document.getElementById("balance");
        balance_element.innerHTML = value.valueOf();
    }).catch(function(e) {
        console.log(e);
        setStatus("Error getting balance; see log.");
    });
}

window.showBalance = function() {
    var meta;
    MetaCoin.deployed().then(function(instance) {
        meta = instance;
        return meta.getBalance.call(admin_account, { from: admin_account });
    }).then(function(value) {
        var balance_element = document.getElementById("balance_span");
        balance_element.innerHTML = "Balance = " + value.valueOf() + " META";
    }).catch(function(e) {
        console.log(e);
        setStatus("Error getting balance; see log.");
    });
}

window.sendCoin = function() {
    var amount = parseInt(document.getElementById("amount").value);
    var receiver = document.getElementById("id_receiver").value;
    
    if (receiver == admin_account) {
        setStatus("Error - Cannot send money to yourself");
        return;
    }

    setStatus("Initiating transaction... (please wait)");

    var meta;
    MetaCoin.deployed().then(function(instance) {
        meta = instance;
        return meta.sendCoin(receiver, amount, { from: admin_account });
    }).then(function() {
        setStatus("Transaction complete!");
        refreshAdminBalance();
    }).catch(function(e) {
        console.log(e);
        setStatus("Error sending coin; see log.");
    });
}

window.getBalance = function() {
    var member = document.getElementById("id_member").value;

    var balance_element = document.getElementById("balance_span");
    var meta;
    MetaCoin.deployed().then(function(instance) {
        meta = instance;
        return meta.getBalance.call(member, { from: member });
    }).then(function(value) {        
        balance_element.innerHTML = "Balance = " + value.valueOf() + " META";
    }).catch(function(e) {
        balance_element.innerHTML = e;
        setStatus("Error retrieving balance; see log.");
    });
}

window.freeMoney = function() {
    var address = document.getElementById("id_recepient").value;
    var meta;

    MetaCoin.deployed().then(function(instance) {
        meta = instance;
        return meta.freeMoney(address, { from: address });
    }).then(function(value) {
        document.getElementById("free_money_div").innerHTML = "Money added: " + value.valueOf();
    }).catch(function(e) {
        console.log(e);
        setStatus("Error retrieving balance; see log.");
    });
}

window.printAccounts = function() {
    try {
        for (var key in account_hashes) {
            $("#account_hashes").append(key + ": " + account_hashes[key] + "<br/>");
        }
    }
    catch(err) {
        $("#account_hashes_status").text(err.message);
    }
}

$(document).ready(function() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
        // Use Mist/MetaMask's provider
        window.web3 = new Web3(web3.currentProvider);
    } else {
        console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }

    // Bootstrap the MetaCoin abstraction for Use.
    MetaCoin.setProvider(web3.currentProvider);

    var self = this;
    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
        if (err != null) {
            alert("There was an error fetching your accounts.");
            return;
        }

        if (accs.length == 0) {
            alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
            return;
        }

        accounts = accs;
        admin_account = accounts[0];

        // Assign account hashes to member names
        for (var i = 0; i < member_names.length; i++) {
            account_hashes[member_names[i]] = accounts[i];
        }

        refreshAdminBalance();

        createMemberDropdowns(member_names);

    }); 
});