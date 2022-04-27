var PetStore = artifacts.require("PetStore");

module.exports = function (deployer) {
  deployer.deploy(PetStore);
};

