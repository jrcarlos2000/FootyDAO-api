# FootyDAO Demo Server

## Chainlink Functions x Chiliz reward distributor

### POST

/api/web3/distribute-rewards/:userStringArray/:totalAmount/:fanTokenId/:requestId

## IPFS File Encryption

### POST

/api/web3/upload-encrypted-file

```javascript
// PARAMS
{
    "creator" : "0x1234567890123456789012345678901234567890",
}
```

## IPFS File Sharing

### POST

/api/web3/complete-purchase

```javascript
// PARAMS
{
    "buyerAddr" : "0x1234567890123456789012345678901234567890",
    "cid" : "Qmasdasdasdsdasdasd1234123asdasdas"
}
```

## IPFS File Decryption

### POST

/api/web3/try-decrypt

```javascript
// PARAMS
{
    "cid" : "Qmasdasdasdsdasdasd1234123asdasdas"
}
```
