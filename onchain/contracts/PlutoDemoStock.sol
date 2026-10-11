// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
/// @notice Testnet-only demonstration token. No claim on securities or Robinhood assets.
contract PlutoDemoStock is ERC20 {
    uint256 public uiMultiplier = 1e18;
    address public immutable operator;
    mapping(address => uint256) public lastClaim;
    constructor(string memory symbol_) ERC20(string.concat("Pluto Demo ", symbol_), string.concat("d", symbol_)) { operator = msg.sender; }
    function faucet() external {
        require(block.timestamp >= lastClaim[msg.sender] + 1 hours, "Wait one hour");
        lastClaim[msg.sender] = block.timestamp; _mint(msg.sender, 1000e18);
    }
    function setMultiplier(uint256 multiplier) external { require(msg.sender == operator && multiplier > 0, "Not operator"); uiMultiplier = multiplier; }
}
