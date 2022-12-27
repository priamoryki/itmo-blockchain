require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const CHAIN_IDS = {
    hardhat: 31337
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    networks: {
        hardhat: {
            chainId: CHAIN_IDS.hardhat,
            forking: {
                url: process.env.ALCHEMY_URL
            }
        }
    },
    solidity: "0.6.12"
};
