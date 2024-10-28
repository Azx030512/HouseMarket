import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      // rpc url, change it according to your ganache configuration
      url: 'http://localhost:8545',
      // the private key of signers, change it according to your ganache user
      accounts: [
        '0xd904d6a8638449fffc9f763ad346fc63ecb21ca5b0b363c5edfa06481d9e5af1',
        '0xffed3e39f92c32bbd71c14f8f442c5ebe20b8341d7ade9a37e64b179f36e6f22',
        '0xe536ac7288189ed4a676bce3337ba21c97983044ca02d05a92da0a42ab445c06',
        '0x5a919720b9ceee3b37a0955f1c45bbd3f6f53823942f96bb152adc03f4cbe98a'
      ]
    },
  },
};

export default config;
