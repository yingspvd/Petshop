App = {
  web3Provider: null,
  contracts: {},

  init: async function () {
    return await App.initWeb3();
  },

  initWeb3: async function () {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });
      } catch (error) {
        // User denied account access...
        console.error("User denied account access");
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:7545"
      );
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function () {
    $.getJSON("Donation.json", function (data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var DonateArtifact = data;
      App.contracts.Donation = TruffleContract(DonateArtifact);
      App.contracts.Donation.setProvider(App.web3Provider);
      App.checkOwner();
      App.myWallet();
      App.getMyDonate();
      App.getTotalDonate();
      App.getMonthlyDonation();
    });

    return App.bindEvents();
  },

  bindEvents: function () {
    $(document).on("click", ".btn-donate", App.handleDonate);
    $(document).on("click", ".btn-claim-donate", App.handleClaimDonate);
  },

  checkOwner: function (event) {
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Donation.deployed()
        .then(function (instance) {
          donateInstance = instance;
          return donateInstance.checkOwner({
            from: account,
          });
        })
        .then((result) => {
          if (result) {
            button = document.getElementById("btn-claim-donate");
            button.style.display = "block";
          }
        })

        .catch(function (err) {
          console.log(err.message);
        });
    });
  },

  myWallet: function () {
    web3.eth.getBalance(web3.eth.accounts[0], function (err, result) {
      if (err) {
        console.log(err);
      } else {
        const mymoney = web3.fromWei(result.toString(), "ether");
        document.getElementById("my_wallet").innerHTML = mymoney;
      }
    });
  },

  handleDonate: function (event) {
    event.preventDefault();
    var eth_value = 0;
    var donateChoice = document.getElementsByName("donateChoice");
    for (i = 0; i < donateChoice.length; i++) {
      if (donateChoice[i].checked) {
        eth_value = donateChoice[i].value;
      }
    }

    if (eth_value == 0) {
      eth_value = document.getElementById("donate_value").value;

      if (eth_value < 0.001) {
        alert("Please fill number more than 0.001");
      }
    }

    var eth_value_wei = web3.toWei(eth_value, "ether");

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Donation.deployed()
        .then(function (instance) {
          donateInstance = instance;

          return donateInstance.donate(eth_value_wei, {
            from: account,
            value: eth_value_wei,
          });
        })
        .then(function (result) {
          App.getMyDonate();
          App.getTotalDonate();
          App.getMonthlyDonation();
          App.myWallet();
          alert("Thanks for your donation amount " + eth_value + " ETH");
          document.getElementById("donate_value").value = "";
        })
        .catch(function (err) {
          console.log(err.message);
        });
    });
  },

  handleClaimDonate: function (event) {
    event.preventDefault();
    console.log("contract");
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Donation.deployed()
        .then(function (instance) {
          donateInstance = instance;

          return donateInstance.claimDonate({
            from: account,
          });
        })
        .then(function (result) {
          if (result) {
            App.getMyDonate();
            App.getTotalDonate();
            App.getMonthlyDonation();
            App.myWallet();
            alert("Successful tranfer to your wallet");
          }
        })
        .catch(function (err) {
          console.log(err.message);
        });
    });
  },

  getMyDonate: function () {
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Donation.deployed()
        .then(function (instance) {
          donateInstance = instance;
          return donateInstance.getDonations({
            from: account,
          });
        })
        .then((result) => {
          const mydonate = web3.fromWei(result.toString(), "ether");
          document.getElementById("own_donate_value").innerHTML = mydonate;
        })

        .catch(function (err) {
          console.log(err.message);
        });
    });
  },

  getMonthlyDonation: function () {
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Donation.deployed()
        .then(function (instance) {
          donateInstance = instance;
          return donateInstance.getMonthlyDonation();
        })
        .then((result) => {
          const totalDonate = web3.fromWei(result.toString(), "ether");
          document.getElementById("month_donate_value").innerHTML = totalDonate;
        })

        .catch(function (err) {
          console.log(err.message);
        });
    });
  },

  getTotalDonate: function () {
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Donation.deployed()
        .then(function (instance) {
          donateInstance = instance;
          return donateInstance.getTotalDonations();
        })
        .then((result) => {
          const totalDonate = web3.fromWei(result.toString(), "ether");
          document.getElementById("total_donate_value").innerHTML = totalDonate;
        })

        .catch(function (err) {
          console.log(err.message);
        });
    });
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
