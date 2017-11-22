import "../stylesheets/app.css";
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract';

import wishingWell_artifacts from '../../build/contracts/BouncingWishingWell.json';
var well = contract(wishingWell_artifacts);

var amntdep;
 
    // check to see if an instance of web3 is already running - if not load the local version.

 if (typeof web3 !== 'undefined') {
            window.web3 = new Web3(web3.currentProvider);
        } else {
            window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
        }

var contractAddress = '0xF62735F52Bd8071eBE29f003d6685FA579E955e9';
well.setProvider(web3.currentProvider);
web3.eth.defaultAccount = web3.eth.accounts[0];
console.log("web3 is working... Default Account: " + window.web3.eth.defaultAccount);

var wellInstance = well.at(contractAddress);

/* when the html document is loaded do this stuff... 

1) get the values i need from my html fields
2) get some values from my default account
3) put those values in the form
4) get a value using a contract call.
5) poll an event log - the UI needs to grab these value before a transaction is recorded.


*/

$(document).ready(function() {

    // assign the default account address to the 'walletAdd ID' span in the html file
    document.getElementById('walletAdd').value =  web3.eth.defaultAccount;
 
   var defaultAddress = document.getElementById('walletAdd').value;

    web3.eth.getBalance(web3.eth.defaultAccount, function(err, res) {
 		var resEth = web3.fromWei(res);
        document.getElementById("balance").innerText = ""+resEth;
    });

  var firstEvent = wellInstance.LogRoundOver({_sender: web3.eth.defaultAccount}, {fromBlock: 0, toBlock: 'latest'});
  firstEvent.watch(function(err, result) {
  if (err) {
    console.log(err)
    return;
  }
  console.log("first log return:" + result)
  amntdep =  web3.fromWei(result.args.amntdep.toString(10), 'ether');
  document.getElementById('amountDeposited').innerText = "We have thrown "+ amntdep + " Ether into the Wishing Well";
  firstEvent.stopWatching()

  })


})

//listen for and update to the log and report.

var event= wellInstance.LogRoundOver({fromBlock: 0, toBlock: 'latest'});
  event.watch(function(err, result) {
    if (err) {
      console.log(err)
      return;
      }
    console.log(result.args)
    amntdep =  web3.fromWei(result.args.amntdep.toString(10), 'ether');
    document.getElementById('amountDeposited').innerText = "We have thrown "+ amntdep + " Ether into the Wishing Well";
  
})

/* below I'm using a form button in my html to trigger a javascript function.
the function grabs the values form the form and assigns them to local variables.
it the uses those variables to unlock the default account. */

window.unlock = function(){

      var defaultAddress = document.getElementById('walletAdd').value;
      var pass = document.getElementById('pswd').value;
      web3.personal.unlockAccount(defaultAddress,pass, 1500);

}

//end of the unlock function

// Call the function that triggers a deposit transaction.
// Writing a new value to the block chain here -its going to cost gas and we should see the transaction tick
// over in our block list when we trigger the event.

// beginnning of the deposit function

window.deposit = function() {



  var defaultAddress = document.getElementById('walletAdd').value;
  var amount = document.getElementById('amnt').value;
  return wellInstance.deposit({from: defaultAddress, value: web3.toWei(amount, "ether"), gas:'3000000'}).
  then(function(result){

      console.log("transaction hash:" + result);

    });

}

  web3.eth.filter('pending').watch(function(){
  web3.eth.getBlock('pending', function(error, result){
  var blockNumber = result.number;

  document.getElementById('latestBlock').innerHTML = result.number;
  document.getElementById('latestBlockTimestamp').innerHTML = Date(result.timeStamp);


    })



 })





   
       

 






