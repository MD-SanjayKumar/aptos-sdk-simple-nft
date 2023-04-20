const express = require("express");
const app = express();
const path = require("path");
const aptos = require("aptos");
const req = require("express/lib/request");
const res = require("express/lib/response");
const port = 4000;

const NODE = "https://fullnode.devnet.aptoslabs.com";
const FAUCET_URL = "https://faucet.devnet.aptoslabs.com";
var account;
const client = new aptos.AptosClient(NODE);
const faucetClient = new aptos.FaucetClient(NODE, FAUCET_URL);
const tokenClient = new aptos.TokenClient(client);

var addr;
var publicKey;
var privateKey;

var collectionName;
var tokenName;

app.get('/user_details', async (req, res)=> {
    addr = req.query.addr;
    publicKey = req.query.pub;
    privateKey = req.query.pvt;
    res.sendFile(path.join(__dirname, "home.html"));
})

app.get("/create_collection", async(req, res)=>{
    var trimPub = publicKey.slice(2,);
    var acc_details = {
        address: addr,
        publicKeyHex: publicKey,
        privateKeyHex: privateKey+trimPub,
    };
    var account = aptos.AptosAccount.fromAptosAccountObject(acc_details);
    const txnHashCol = await tokenClient.createCollection(
        account,
        req.query.colName,
        req.query.description,
        req.query.uri,
      );
    await client.waitForTransaction(txnHashCol, { checkSuccess: true });
    res.send(`Transaction Hash: <a href="https://explorer.aptoslabs.com/txn/${txnHashCol}" target="_blank">${txnHashCol}</a>`);
})

app.get("/createtoken", async(req, res)=>{
    var trimPub = publicKey.slice(2,);
    var acc_details = {
        address: addr,
        publicKeyHex: publicKey,
        privateKeyHex: privateKey+trimPub,
    };
    var account = aptos.AptosAccount.fromAptosAccountObject(acc_details);
    const txnHashToken = await tokenClient.createToken(
        account,
        req.query.coll_name,
        req.query.token_name,
        req.query.description,
        req.query.supply,
        req.query.uri,
      );
    await client.waitForTransaction(txnHashToken, { checkSuccess: true });
    res.send(`Transaction Hash: <a href="https://explorer.aptoslabs.com/txn/${txnHashToken}" target="_blank">${txnHashToken}</a>`);
})

app.get("/tokendetails", async(req, res)=>{
    var trimPub = publicKey.slice(2,);
    var acc_details = {
        address: addr,
        publicKeyHex: publicKey,
        privateKeyHex: privateKey+trimPub,
    };
    var account = aptos.AptosAccount.fromAptosAccountObject(acc_details);
    var Token = await tokenClient.getToken(
        account.address(),
        req.query.coll_d,
        req.query.token_d,
      );
    console.log(Token);
    res.send(`Collection Name: <b>${Token.id.token_data_id.collection}</b><br><br>Creator: <b>${Token.id.token_data_id.creator}</b><br><br>Token Name: <b>${Token.id.token_data_id.name}</b><br><br>Amount: <b>${Token.amount}</b>`);
})

app.get("/collectiondetails", async(req, res)=>{
    var trimPub = publicKey.slice(2,);
    var acc_details = {
        address: addr,
        publicKeyHex: publicKey,
        privateKeyHex: privateKey+trimPub,
    };
    var account = aptos.AptosAccount.fromAptosAccountObject(acc_details);
    var Token = await tokenClient.getCollectionData(
        account.address(),
        req.query.coll_d,
      );
    console.log(Token);
    res.send(`Collection Name: <b>${Token.name}</b><br><br>Collection Description: <b>${Token.description}</b><br><br>Supply: <b>${Token.supply}</b><br><br>Collection URI: <b>${Token.uri}</b>`);
})

app.get("/current_ownership", async(req, res) =>{
    var trimPub = publicKey.slice(2,);
    var acc_details = {
        address: addr,
        publicKeyHex: publicKey,
        privateKeyHex: privateKey+trimPub,
    };
    var account = aptos.AptosAccount.fromAptosAccountObject(acc_details);
    const provider = new aptos.Provider(aptos.Network.DEVNET);
    const nfts = await provider.getAccountNFTs(account.address().hex());

    const indexerLedgerInfo = await provider.getIndexerLedgerInfo();
    const fullNodeChainId = await provider.getChainId();
    // console.log(nfts);
    console.log(indexerLedgerInfo);
    console.log(fullNodeChainId);
    res.send(`${account.address()} current token ownership: ${nfts.current_token_ownerships.length}`);
})


app.get("/offer_token", async(req, res)=>{
    var trimPub = publicKey.slice(2,);
    var acc_details = {
        address: addr,
        publicKeyHex: publicKey,
        privateKeyHex: privateKey+trimPub,
    };
    var account = aptos.AptosAccount.fromAptosAccountObject(acc_details);
    var pubk = req.query.pubk;
    var pvtk = req.query.pvtk;
    var adrs = req.query.adrs;
    var trim = pubk.slice(2,);
    var acc2_details = {
        address: adrs,
        publicKeyHex: pubk,
        privateKeyHex: pvtk+trim,
    };
    var account2 = aptos.AptosAccount.fromAptosAccountObject(acc2_details);

    var amt = parseInt(req.query.amount)
    var property_value = parseInt(req.query.pv)
    var TokenTxn = await tokenClient.directTransferToken(
        account,
        account2,
        account.address(),
        req.query.colName,
        req.query.tokenName,
        amt,
        property_value,
    );
    await client.waitForTransaction(TokenTxn, { checkSuccess: true });
    res.send(`Transaction Hash: <a href="https://explorer.aptoslabs.com/txn/${TokenTxn}" target="_blank">${TokenTxn}</a>`);
})

app.get("/optin", async(req, res)=>{
    var addr = req.query.addr; 
    var pub = req.query.pub;
    var pvt = req.query.pvt;  
    var trimPub = pub.slice(2,);
    var ac = {
        address: addr,
        publicKeyHex: pub,
        privateKeyHex: pvt+trimPub,
    };
    var account = aptos.AptosAccount.fromAptosAccountObject(ac);
    var TokenTxn = await tokenClient.optInTokenTransfer(
        account, 
        true
    );
    await client.waitForTransaction(TokenTxn, { checkSuccess: true });
    res.send(`Transaction Hash: <a href="https://explorer.aptoslabs.com/txn/${TokenTxn}" target="_blank">${TokenTxn}</a>`);
})

app.get("/offer_tok", async(req, res)=> {
    var amt = parseInt(req.query.amount)
    var trimPub = publicKey.slice(2,);
    var acc_details = {
        address: addr,
        publicKeyHex: publicKey,
        privateKeyHex: privateKey+trimPub,
    };
    var account = aptos.AptosAccount.fromAptosAccountObject(acc_details);
    var TokenTxn = await tokenClient.offerToken(
        account,
        req.query.raddr,
        account.address(),
        req.query.colName,
        req.query.tokenName,
        amt,
    );
    await client.waitForTransaction(TokenTxn, { checkSuccess: true });
    res.send(`Transaction Hash: <a href="https://explorer.aptoslabs.com/txn/${TokenTxn}" target="_blank">${TokenTxn}</a>`);
})

app.get("/claim_tok", async(req, res)=>{
    var trimPub = publicKey.slice(2,);
    var acc_details = {
        address: addr,
        publicKeyHex: publicKey,
        privateKeyHex: privateKey+trimPub,
    };
    var account = aptos.AptosAccount.fromAptosAccountObject(acc_details);
    var TokenTxn = await tokenClient.claimToken(
        account,
        req.query.sender,
        req.query.creator,
        req.query.colName,
        req.query.tokenName,
    );
    await client.waitForTransaction(TokenTxn, { checkSuccess: true });
    res.send(`Transaction Hash: <a href="https://explorer.aptoslabs.com/txn/${TokenTxn}" target="_blank">${TokenTxn}</a>`);
})

app.get("/optin_direct", async(req, res)=>{
    var trimPub = publicKey.slice(2,);
    var acc_details = {
        address: addr,
        publicKeyHex: publicKey,
        privateKeyHex: privateKey+trimPub,
    };
    amt = req.query.amount;
    var account = aptos.AptosAccount.fromAptosAccountObject(acc_details);
    var TokenTxn = await tokenClient.transferWithOptIn(
        account,
        req.query.creator,
        req.query.colName,
        req.query.tokenName,
        req.query.pr_version,
        req.query.receiver,
        amt,
    );
    await client.waitForTransaction(TokenTxn, { checkSuccess: true });
    res.send(`Transaction Hash: <a href="https://explorer.aptoslabs.com/txn/${TokenTxn}" target="_blank">${TokenTxn}</a>`);
})

app.get("/home", async(req, res) =>{
    res.sendFile(path.join(__dirname, "createAccount.html"));
})

app.get("/", async(req, res) =>{
    res.sendFile(path.join(__dirname, "first.html"));
})

app.get("/create", async(req, res) =>{
    res.sendFile(path.join(__dirname, "details.html"));
})

app.get("/create_token", async(req, res) =>{
    res.sendFile(path.join(__dirname, "token_details.html"));
})

app.get("/gt", async(req, res) =>{
    res.sendFile(path.join(__dirname, "get_token_data.html"));
})

app.get("/gc", async(req, res) =>{
    res.sendFile(path.join(__dirname, "get_collection_data.html"));
})

app.get("/transfer_token", async(req, res) =>{
    res.sendFile(path.join(__dirname, "transfer.html"));
})

app.get("/claim_token", async(req, res) =>{
    res.sendFile(path.join(__dirname, "claim.html"));
})

app.get("/ot", async(req, res) =>{
    res.sendFile(path.join(__dirname, "offer_tokens.html"));
})

app.listen(port, async()=>{
    console.log(`Listening to port ${port}`);
})

// ---------------------------------