var BouncingWishingWell = artifacts.require("./BouncingWishingWell.sol");


module.exports = function(deployer) {
  deployer.deploy(BouncingWishingWell);
};
