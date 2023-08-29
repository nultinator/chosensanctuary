import Navbar from "./Navbar";
import NFTTile from "./NFTTile";
import MarketplaceJSON from "../Marketplace.json";
import { SERVER_LOCATION } from "../utils";



import axios from "axios";
import { useState, useEffect } from "react";
import { useParams } from "react-router";


var sampleData = [
    
    {
        "name": "NFT#1",
        "description": "Your NFT Goes Here",
        "website":"https://chosensanctuary.com",
        "image":"../full_logo.jpg",
        "price":"0.03ETH",
        "currentlySelling":"True",
        "address":"0xe81Bf5A757CB4f7F82a2F23b1e59bE45c33c5b13",
    }
    
];

const contract_address = MarketplaceJSON.address;
console.log("Contract Address: " + contract_address);

export default function Marketplace() {



const [data, updateData] = useState(sampleData);
const [dataFetched, updateFetched] = useState(false);
useEffect(() => {
    getAllNFTs();
}, []);



//retrieve nft data about a specific address
async function getNFTData(address) {
    let url = `${SERVER_LOCATION}/getNFTData/address?address=${address}`;
    let data = await axios.get(url).catch((error) => {
        console.log("error:", error);
        return;
    });
    console.log("GETNFTDATA", data);
    return data;
}

async function getNFTsHeldByAddress(address) {
    //create an array to hold the user's nfts
    console.log("Address", address);  
    let url = `${SERVER_LOCATION}/getHeldByAddress/address?address=${address}`;  
    //make the get request
    const nfts_array = await axios.get(url).catch((error) => {
    //return immediately in the event of an error
      console.log("error", error);
      return;
    });
    //console.log("address nft info", nfts_array);
    //we got the nfts, return them to whatever is calling them
    console.log("NFT ARRAY", nfts_array.data);
    return nfts_array.data.ownedNfts;
}


async function getAllNFTs() {
    //create an array to hold the NFT objects
    const return_array = [];

    //import ethers
    const ethers = require("ethers");
    console.log("imported ethers");
    //After adding your Hardhat network to your metamask, this code will get providers and signers
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    console.log("talking to metamask");
    const signer = provider.getSigner();
    console.log("connected to wallet", signer);
    //Pull the deployed contract instance
    let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
    const contractAddress = await MarketplaceJSON.address;
    //fetch and log NFTs held by the contract
    console.log("Contract address: ", contractAddress);
    const listedNFTs = await getNFTData(contractAddress);
    console.log("Contract NFT Data\n" + listedNFTs);
    let transaction = await getNFTsHeldByAddress(MarketplaceJSON.address);
    console.log("CONTRACT NFT DATA", transaction);

    //Fetch all the details of every NFT from the contract and display
    const items = await Promise.all(transaction.map(async i => {
        //price is held in the token metadata
        const price = i.metadata.price;

        let item = {
            price,
            //convert the price to a readable number from hex
            tokenId: Number(i.id.tokenId),
            description: i.metadata.description,
            website: "https://chosensanctuary.eth",
            seller: i.seller,
            image: i.metadata.image,
            name: i.title,
            contractAddress: i.contract.address,
        }
        console.log(`ITEM\n${JSON.stringify(item)}`);
        return_array.push(item);
    }))
    
    //console.log("global return array", return_array);
    const tokenHeight = await contract.getCurrentToken();
    const listHeight = await contract.getCurrentListHeight();
    console.log("Current token amount", Number(tokenHeight._hex));
    console.log("Current List Height", Number(listHeight._hex));
    updateData(return_array);
}


//Render the info Below
return (
    <div>
        <Navbar></Navbar>
        <div className="flex flex-col place-items-center mt-20">
            <div className="md:text-xl font-bold text-white">
                Top NFTs
            </div>
            <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">
                {data.map((value, index) => {
                    return <NFTTile data={value} key={index}></NFTTile>;
                })}
            </div>
        </div>            
    </div>
);

}