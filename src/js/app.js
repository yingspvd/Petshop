App = {
  web3Provider: null,
  contracts: {},

  init: async function () {
    // Load pets.
    $.getJSON("../pets.json", function (data) {
      var petsRow = $("#petsRow");
      var petTemplate = $("#petTemplate");

      for (i = 0; i < data.length; i++) {
        petTemplate.find(".panel-title").text(data[i].name);
        petTemplate.find("img").attr("src", data[i].picture);
        petTemplate.find(".pet-breed").text(data[i].breed);
        petTemplate.find(".pet-age").text(data[i].age);
        petTemplate.find(".pet-location").text(data[i].location);
        petTemplate.find(".pet-price").text(data[i].price);
        petTemplate.find(".btn-buyPet").attr("data-price", data[i].price);
        petsRow.append(petTemplate.html());
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
    $.getJSON("PetStore.json", function (data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var PetStoreArtifact = data;
      App.contracts.PetStore = TruffleContract(PetStoreArtifact);
      App.contracts.PetStore.setProvider(App.web3Provider);
      App.myWallet();
    });

    return App.bindEvents();
  },

  bindEvents: function () {
    $(document).on("click", ".btn-buyPet", App.handleBuyPet);
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

  handleBuyPet: function (event) {
    event.preventDefault();

    var petPrice = $(event.target).data("price");
    var eth_value_wei = web3.toWei(petPrice, "ether");

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.PetStore.deployed()
        .then(function (instance) {
          petStoreInstance = instance;

          // Execute adopt as a transaction by sending account
          return petStoreInstance.payPet(eth_value_wei, {
            from: account,
            value: eth_value_wei,
          });
        })
        .then(function (result) {
          App.myWallet();
          alert("Successful Payment. Thank You For Choosing Us :) ");
          petStoreInstance.claimMoney();
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
