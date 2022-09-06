// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    constructor() ERC20("Example Stable Token", "EST") {
        _mint(msg.sender, 1000000000000000000000);
    }

    function mint(address _address, uint256 _amount  )  public {

        _mint(_address,_amount);

    }
}
