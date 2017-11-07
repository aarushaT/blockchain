// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3 } from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import metacoin_artifacts from '../../build/contracts/MetaCoin.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
var MetaCoin = contract(metacoin_artifacts);
var BigNumber = require('bignumber.js')
// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var admin_account;

var num_signed_up = 0;
// Hard-coded member names. The first member owns contracts by default (hence Admin).
var member_emails = [];
// Associative array to link names to account hashes
var account_hashes = {};

var num_members;

window.updateMembers = function() {
    getMemberCount().then(function(result) {
        $("#num_members_span").text(result.toNumber());
    }).catch(function(err) {
        cosole.log("Could not retrieve member count");
        console.log(err);
    });    
}

window.isValidEmail = function ($email) {
  var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
  return emailReg.test( $email );
}

window.setStatus = function(message) {
    $("#status").text("Status: " + message);
}

// window.refreshAdminBalance = function() {
//     var meta;
//     MetaCoin.deployed().then(function(instance) {
//         meta = instance;
//         return meta.getBalance.call(admin_account, { from: admin_account });
//     }).then(function(value) {
//         var balance_element = document.getElementById("balance");
//         balance_element.innerHTML = value.valueOf();
//     }).catch(function(e) {
//         console.log(e);
//         setStatus("Error getting balance; see log.");
//     });
// }

// window.showBalance = function() {
//     var meta;
//     MetaCoin.deployed().then(function(instance) {
//         meta = instance;
//         return meta.getBalance.call(admin_account, { from: admin_account });
//     }).then(function(value) {
//         var balance_element = document.getElementById("balance_span");
//         balance_element.innerHTML = "Balance = " + value.valueOf() + " META";
//     }).catch(function(e) {
//         console.log(e);
//         setStatus("Error getting balance; see log.");
//     });
// }

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

window.checkBalance = function() {
    var member_email = $("#id_check_balance_email").val();
    
    var member_address = getMemberAddressFromTable(member_email);
    var $balance_element = $("#check_balance_div");

    if (member_address != null) {
        
        var meta;
        MetaCoin.deployed().then(function(instance) {
            meta = instance;
            return meta.getBalance.call(member_address, { from: member_address });
        }).then(function(value) {
            $balance_element.html("Balance = " + value.valueOf() + " META");
        }).catch(function(e) {
            $balance_element.html("Could not retrieve balance");
            setStatus("Error retrieving balance; see log.");
        });
    }
    else {
        console.log("Invalid email: member does not exist");
        $balance_element.html("Invalid email: member does not exist");
    }
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

// Add participant's address to contract
window.addMember = function() {
    var $member_email = $("#member_email").val();
    var count_promise = getMemberCount();
    var contract_promise = MetaCoin.deployed();
    var new_address;

    if (isValidEmail($member_email)) {
        Promise.all([count_promise, contract_promise]).then(function(results) {
            var num_members = results[0].toNumber();
            var contract_instance = results[1];
            if (num_members < (accounts.length-1)) {
                new_address = accounts[num_members+1];
                console.log(num_members);  
                var transaction = contract_instance.addMember(new_address, $member_email, {from: admin_account, gas: 200000});
                updateMemberTable(new_address);
                updateMembers();
            }
            else {
                setStatus("Reached member limit!");
                console.log("Could not add: too many accounts!");
            }
            }).catch(function(err) {
                setStatus("Sign up failed");
                console.log("Sign up failed");
                console.log(err);
            });
    }
    else {
        console.log("Sign up failed: invalid email");
        setStatus("Please enter a valid email");
    }
}

window.getMemberCount = function() {
    var meta;
    var member_count;
    return MetaCoin.deployed().then(function(instance) {
        meta = instance;
        return meta.getMemberCount.call();
    }).catch(function (err) {
        console.log(err);
        setStatus("Could not call getMemberCount properly.");
    });
}

window.collectFunds = async function() {
    var meta = MetaCoin.deployed();

    var addresses_promise = meta.then(function(instance) {
        meta = instance;
        return meta.getMemberAddresses.call();
    }).catch(function (err) {
        console.log("Could not get addresses");
        console.log(err);
    });

    Promise.all([meta, addresses_promise]).then(async function(results) {
        var contract_instance = results[0];
        var addresses = results[1];
        
        for (var i=0; i < addresses.length; i++) {
            await contract_instance.collectFunds(addresses[i], { from: admin_account }).then(function(result) {
                var fundsCollectedEvent = false;
                if (result.logs) {
                    console.log("Collected funds for address: " + addresses[i]);
                    var logs = result.logs;
                    if (logs[0].event == "CollectedFunds") {
                        fundsCollectedEvent = true;
                    }
                }
                else {
                    console.log("Could not collect funds for address: " + addresses[i]);
                }
            }).catch(function(err) {
                console.log(err);
                console.log("Collect funds failed for address: " + addresses[i] + ": balance too low");
                setStatus("Collect funds failed for address: " + addresses[i] + ": balance too low");
            });
        }
    });
}

window.purchaseTickets = function() {
    var meta = MetaCoin.deployed();
    var fundsCollected = false;
    for (var i = 0; i < result.logs.length; i++) {
        var log = result.logs[i];

        if (log.event == "CollectedFunds") {
            fundsCollected = true;
            break;
        }
    }  
}

window.setMemberTable = async function() {
    var meta, account_name, account_balance;

    var contract_promise = MetaCoin.deployed();
    var count_promise = getMemberCount().catch(function(err) {
        cosole.log("Could not retrieve member count");
        console.log(err);
    });
    var addresses_promise = MetaCoin.deployed().then(function(instance) {
        meta = instance;
        return meta.getMemberAddresses.call();
    }).catch(function (err) {
        console.log("Could not get addresses");
        console.log(err);
    });

    Promise.all([count_promise, addresses_promise, contract_promise]).then(async function(results) {
        var member_count = results[0].toNumber();
        var member_addresses = results[1];
        var contract_instance = results[2];        

        var $num_rows = $(".member-table-body").children("tr").length;
                
        var start_index = ($num_rows == 0) ? 0 : ($num_rows - 1);
        var new_member_count = member_count - $num_rows;

        for(var i=start_index; i < new_member_count; i++) {
            var $new_row = $("<tr>", {id: member_addresses[i]});

            await contract_instance.getAccount.call(member_addresses[i]).then(function(account) {
                account_name = account[0];
                account_balance = account[1].toNumber();
                var $name = $("<td>", {class: "col-1"}).text(account_name);
                var $balance = $("<td>", {class: "col-1"}).text(account_balance);
                $new_row = $new_row.append($name);
                $new_row = $new_row.append($balance);
                $(".member-table-body").append($new_row);
            }).catch(function(err) {
                console.log("Couldn't get account");
                console.log(err);
            });
        }
    });
}

window.updateMemberTable = function(address) {
    var meta;

    if (address) {
        MetaCoin.deployed().then(function(instance) {
            meta = instance;
            return meta.getAccount.call(address);
        }).then(function(account) {
            var account_name = account[0];
            var account_balance = account[1].toNumber();
            
            var $new_row = $("<tr>", {id: address});
            var $name = $("<td>").text(account_name);
            var $balance = $("<td>").text(account_balance);
            $new_row = $new_row.append($name);
            $new_row = $new_row.append($balance);
            $(".member-table-body").append($new_row);
        }).catch(function(err) {
            console.log("Could not update member table");
            console.log(err);
        });
    }
    else {
        console.log("Could not add: too many accounts or invalid address!");
        setStatus("Reached member limit");
    }
}

window.getMemberAddressFromTable = function($member_email) {
    var email_cells = $(".member-table-body").find("td:even");
    for (var i=0; i < email_cells.length; i++) {
        if ($(email_cells[i]).text() == $.trim($member_email)) {
            return $(email_cells[i]).parent("tr").attr("id");
        }
    }
    return null;    
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
    
        updateMembers();
        setMemberTable();
    });
})