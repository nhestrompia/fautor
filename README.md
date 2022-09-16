Fautor - a recurring payment integrated subscription dApp (on Goerli Testnet)


A subscription dApp where people can create plans for their fans/supporters and upload NFTs for each tier. Monthly payments will be done automatically when payment time comes.

Creators upload the image while creating each tier and images will be deployed to IPFS via nft.storage. For each tier NFT, ERC-1155 standard is being used. Payments is being done with an example ERC-20 deployed to Goerli Testnet. In the user page there is a mint button for the token. This system can be extended for many token options also the contract only allow the whitelisted tokens for payments to prevent dusting attacks.

There is also a donation functionality in the dApp where supports can be done both via ETH and EST(Example Stable Token).

For subscription payments, the predetermined address will receive 8% of each subscription payment. For donations, 4% each donation will be sent to predetermined address in the same transaction with a payment splitting logic.





Used technologies

Backend

    Solidity,
    OpenZeppelin,
    IPFS and nft.storage,
    Hardhat,
    mongoDB,
    nodeJS

Frontend

    React,
    Next.js,
    Ethers,

Testing

    Hardhat,
    Chai
    
