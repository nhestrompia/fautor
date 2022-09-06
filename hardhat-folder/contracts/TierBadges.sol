// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

  import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
  import "@openzeppelin/contracts/access/Ownable.sol";
 




 contract TierBadges is ERC1155, Ownable {
    
  



    string public name ;
    string public symbol;
    address public minterContractAddress;
    

   

 
    mapping (uint256 => string) private _uris;

    constructor() ERC1155("") {
      name = "Member Badges";
      symbol = "MB";
      minterContractAddress = msg.sender;
    }

 function setMinterAddress(address _minterContractAddress) public onlyOwner {
      minterContractAddress = _minterContractAddress;
    }
    

 modifier onlyMinter() {
      
        require(msg.sender == minterContractAddress,  "You aren't allowed to mint");
        _;
    }

    function mint(address _minter, uint256 tokenId ) external onlyMinter {
      _mint(_minter,tokenId,1,"");
    }
    
    function uri(uint256 tokenId) override public view returns (string memory)  {
        return(_uris[tokenId]);
    }

    bool public canReset = false;



    function uriReset() external onlyMinter {
      canReset = !canReset;
        
    }

    
    


    function setTokenUri(uint256 tokenId, string memory _uri) external onlyMinter {
      
      if(!canReset) {
        require(bytes(_uris[tokenId]).length == 0, "Cannot set uri twice"); 
        _uris[tokenId] = _uri; 
      }else{
        _uris[tokenId] = _uri;
        canReset = !canReset;
      }
        
    }
}
