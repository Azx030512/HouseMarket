// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

// Uncomment the line to use openzeppelin/ERC721,ERC20
// You can use this dependency directly because it has been installed by TA already
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Uncomment this line to use console.log
import "hardhat/console.sol";

contract BuyMyRoom is ERC721, Ownable {
    event HouseListed(uint256 tokenId, uint256 price, address owner);
    event HouseSold(uint256 tokenId, uint256 price, address buyer);

    struct House {
        address owner;
        uint256 price;
        uint256 listedTimestamp;
    }

    mapping(uint256 => House) public houses; // A map from tokenId to house information
    uint256 public nextTokenId;
    
    constructor() ERC721("BuyMyRoom", "BMR") Ownable(msg.sender) { // Initialize ERC721 and Ownable with msg.sender
        nextTokenId = 1;
    }

    function mintHouse(address to) external onlyOwner {
        uint256 tokenId = nextTokenId;
        _safeMint(to, tokenId);
        houses[tokenId] = House(to, 0, 0);
        nextTokenId++;
    }

    function listHouse(uint256 tokenId, uint256 price) external {
        require(ownerOf(tokenId) == msg.sender, "Not the house owner");
        require(price > 0, "Price must be greater than zero");

        houses[tokenId].price = price;
        houses[tokenId].listedTimestamp = block.timestamp;

        emit HouseListed(tokenId, price, msg.sender);
    }

    function buyHouse(uint256 tokenId) external payable {
        House memory house = houses[tokenId];
        require(house.price > 0, "House not for sale");
        require(msg.value >= house.price, "Insufficient payment");

        // Transfer ownership and update house data
        address seller = ownerOf(tokenId);
        _transfer(seller, msg.sender, tokenId);
        houses[tokenId].owner = msg.sender;
        houses[tokenId].price = 0;
        houses[tokenId].listedTimestamp = 0;

        // Calculate and transfer fee
        uint256 fee = calculateFee(house.price, house.listedTimestamp);
        payable(owner()).transfer(fee);
        payable(seller).transfer(msg.value - fee);

        emit HouseSold(tokenId, house.price, msg.sender);
    }

    function calculateFee(uint256 price, uint256 listedTimestamp) public view returns (uint256) {
        uint256 timeListed = block.timestamp - listedTimestamp;
        uint256 feeRate = 1; // 1% fee rate
        return (price * timeListed * feeRate) / 10000;
    }

    function getHouseInfo(uint256 tokenId) external view returns (address, uint256, uint256) {
        House memory house = houses[tokenId];
        return (house.owner, house.price, house.listedTimestamp);
    }
}