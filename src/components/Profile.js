import Navbar from "./Navbar";
import { useLocation, useParams } from 'react-router-dom';
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState } from "react";
import NFTTile from "./NFTTile";
import { SERVER_LOCATION } from "../utils";

export default function Profile () {
    const [data, updateData] = useState([]);
    const [dataFetched, updateFetched] = useState(false);
    const [address, updateAddress] = useState("0x");
    const [totalPrice, updateTotalPrice] = useState("0");
    
    async function getNFTsHeldByAddress(address) {
        
        //create an array to hold the user's nfts
        let nfts_array = [];        
        console.log("Fetching nfts");
        const url = `${SERVER_LOCATION}/getHeldByAddress/address?address=${address}`   
        console.log("trying", url);
        //make the get request
        nfts_array = await axios.get(url).catch((error) => {
        //return immediately in the event of an error
          console.log("error", error);
          return;
        });
        console.log("address nft info", nfts_array);
        //we got the nfts, return them to whatever is calling them
        return nfts_array.data.ownedNfts;
    }
    
    //get the user's nft data for the display
    async function getNFTData(tokenId) {
        //import ethers
        const ethers = require("ethers");
        console.log("imported ethers");
        //attempt to connect to user wallet
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        console.log("Connecting to wallet");
        //user signs and authorizes the connection
        const signer = await provider.getSigner();
        //get the user's address
        const addr = await signer.getAddress();
        console.log("connected to", addr);
        //get list of tokens held by the user
        let tokens = await getNFTsHeldByAddress(addr);
        console.log("getting nfts held by wallet");
        console.log("Tokens", tokens);
        //declare a constant and await the result of the process below
        const items = await Promise.all(tokens.map(async i => {
            //properties of each token that we will use in our UI
            const tokenURI = await i.tokenUri.gateway;
            let meta = i.metadata;
            let name = meta.name;
            let item = {
                //need to convert from hex to standard number format
                tokenId: Number(i.id.tokenId),
                image: meta.image,
                name: meta.name,
                description: meta.description,
                contractAddress: i.contract.address,
            }
            console.log("item contract address", item.contractAddress);
            return item;
        }))
        //we have our data, now to give it to React
        updateData(items);
        updateFetched(true);
        updateAddress(addr);
    }


    const params = useParams();
    const tokenId = params.tokenId;
    const contractAddress = params.contractAddress;
    console.log("Profile Page params", params);
    if(!dataFetched)
        getNFTData(tokenId);
    //return and render the jsx below to the user
    return (
        <div className="profileClass" style={{"min-height":"100vh"}}>
            <Navbar></Navbar>
            <div className="profileClass">
            <div className="flex text-center flex-col mt-11 md:text-2xl text-white">
                <div className="mb-5">
                    <h2 className="font-bold">Wallet Address</h2>  
                    {address}
                </div>
            </div>
            <div className="flex flex-row text-center justify-center mt-10 md:text-2xl text-white">
                    <div>
                        <h2 className="font-bold">No. of NFTs</h2>
                        {data.length}
                    </div>
                    <div className="ml-20">
                        <h2 className="font-bold">Total Value</h2>
                        {totalPrice} ETH
                    </div>
            </div>
            <div className="flex flex-col text-center items-center mt-11 text-white">
                <h2 className="font-bold">Your NFTs</h2>
                <div className="flex justify-center flex-wrap max-w-screen-xl">
                    {data.map((value, index) => {
                    return (
                    <div>
                        <NFTTile data={value} key={index}></NFTTile>
                    </div>);
                    })}
                </div>
                <div className="mt-10 text-xl">
                    {data.length == 0 ? "Oops, No NFT data to display (Are you logged in?)":""}
                </div>
            </div>
            </div>
        </div>
    )
    }
