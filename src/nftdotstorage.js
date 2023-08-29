//require('dotenv').config();
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDkwRTE4NjI3ZTFiNjU5OEFhMUJiOUI0MWZmNEVlQTU1OGIyNzA5OTAiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY5MjM3NzQ3ODMzOCwibmFtZSI6ImNzLW1hcmtldHBsYWNlIn0.PPr1cPC4o9UNM3vr243GPIgt6_4Y4eBHpA6oH5uxTMw";

const axios = require('axios');
const FormData = require('form-data');

export const uploadJSONToIPFS = async(JSONBody) => {
    const url = `https://api.nft.storage/upload`;
    //making axios POST request to Pinata ⬇️
    return axios 
        .post(url, JSONBody, {
            headers: {
                "Authorization": `Bearer ${key}`,
            }
        })
        .then(function (response) {
           return {
               success: true,
               pinataURL: "https://ipfs.io/ipfs/" + response.data.value.cid
           };
        })
        .catch(function (error) {
            console.log(error)
            return {
                success: false,
                message: error.message,
            }

    });
};

export const uploadFileToIPFS = async(file) => {
    const url = `https://api.nft.storage/upload`;
    //making axios POST request to Pinata ⬇️
    
    let data = new FormData();
    data.append('file', file);

    const metadata = JSON.stringify({
        name: 'testname',
        keyvalues: {
            exampleKey: 'exampleValue'
        }
    });
    data.append('ipfsMetadata', metadata);

    /* pinataOptions are optional
    const pinataOptions = JSON.stringify({
        cidVersion: 0,
        customPinPolicy: {
            regions: [
                {
                    id: 'FRA1',
                    desiredReplicationCount: 1
                },
                {
                    id: 'NYC1',
                    desiredReplicationCount: 2
                }
            ]
        }
    });
    data.append('pinataOptions', pinataOptions);
    */
    return axios 
        .post(url, data, {
            maxBodyLength: 'Infinity',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                "Authorization": `Bearer ${key}`,
            }
        })
        .then(function (response) {
            console.log("image uploaded", response.data.IpfsHash)
            return {
               success: true,
               pinataURL: "https://ipfs.io/ipfs/" + response.data.value.cid + "/" + file.name
           };
        })
        .catch(function (error) {
            console.log(error)
            return {
                success: false,
                message: error.message,
            }

    });
};