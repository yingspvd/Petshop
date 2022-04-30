App = {
  web3Provider: null,
  contracts: {},

  init: async function () {
    // Load pets.
    $.getJSON("../store.json", function (data) {
      var storeRow = $("#storeRow");
      var storeTemplate = $("#storeTemplate");

      for (i = 0; i < data.length; i++) {
        storeTemplate.find(".card-title").text(data[i].name);
        storeTemplate.find("img").attr("src", data[i].picture);
        storeTemplate.find(".store-price").text(data[i].price);
        storeTemplate.find(".btn-buy").attr("data-price", data[i].price);
        storeRow.append(storeTemplate.html());
      }
    });

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
    $.getJSON("ProductStore.json", function (data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var StoreArtifact = data;
      App.contracts.ProductStore = TruffleContract(StoreArtifact);
      App.contracts.ProductStore.setProvider(App.web3Provider);
      App.myWallet();
    });

    return App.bindEvents();
  },

  bindEvents: function () {
    $(document).on("click", ".btn-buy", App.handleBuy);
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

  handleBuy: function (event) {
    event.preventDefault();

    var productPrice = $(event.target).data("price");
    var eth_value_wei = web3.toWei(productPrice, "ether");

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.ProductStore.deployed()
        .then(function (instance) {
          storeInstance = instance;

          // Execute adopt as a transaction by sending account
          return storeInstance.payProduct(eth_value_wei, {
            from: account,
            value: eth_value_wei,
          });
        })
        .then(function (result) {
          App.myWallet();
          alert("Successful Payment. Thank You For Choosing Us :) ");
        })
        .catch(function (err) {
          console.log(err.message);
        });
    });
  },

  transferMoney: function () {
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.ProductStore.deployed()
        .then(function (instance) {
          storeInstance = instance;
          return storeInstance.claimMoney();
        })
        .then(function (result) {
          alert("Successful Transfer");
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
