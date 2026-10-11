// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

/// @notice Ownerless, fixed-constituent basket. Holdings are raw ERC20 units.
/// Corporate actions change issuer uiMultiplier(), not the amount owed to this vault.
contract PlutoBasket is ERC20, ReentrancyGuard {
    using SafeERC20 for IERC20;
    address[] public constituents;
    uint256[] public initialUnits;
    uint256 public constant SHARE = 1e6;
    error InvalidBasket();
    error InvalidAmount();
    error Slippage();
    error ShortTransfer();
    event Created(address indexed account, uint256 shares, uint256[] amounts);
    event Redeemed(address indexed account, uint256 shares, uint256[] amounts);

    constructor(string memory name_, string memory symbol_, address[] memory tokens, uint256[] memory units) ERC20(name_, symbol_) {
        if (tokens.length < 2 || tokens.length > 20 || tokens.length != units.length) revert InvalidBasket();
        for (uint256 i; i < tokens.length; i++) {
            if (tokens[i].code.length == 0 || units[i] == 0) revert InvalidBasket();
            for (uint256 j; j < i; j++) if (tokens[i] == tokens[j]) revert InvalidBasket();
        }
        constituents = tokens; initialUnits = units;
    }
    function decimals() public pure override returns (uint8) { return 6; }
    function tokens() external view returns (address[] memory) { return constituents; }
    function quote(uint256 shares) public view returns (uint256[] memory createIn, uint256[] memory redeemOut) {
        createIn = new uint256[](constituents.length); redeemOut = new uint256[](constituents.length);
        uint256 supply = totalSupply();
        for (uint256 i; i < constituents.length; i++) {
            uint256 held = supply == 0 ? initialUnits[i] : IERC20(constituents[i]).balanceOf(address(this));
            uint256 denominator = supply == 0 ? SHARE : supply;
            createIn[i] = Math.mulDiv(held, shares, denominator, Math.Rounding.Ceil);
            redeemOut[i] = supply == 0 || shares > supply ? 0 : Math.mulDiv(held, shares, supply);
        }
    }
    function create(uint256 shares, uint256[] calldata maximum) external nonReentrant {
        if (shares == 0 || (totalSupply() == 0 && shares < SHARE) || maximum.length != constituents.length) revert InvalidAmount();
        (uint256[] memory amounts,) = quote(shares);
        for (uint256 i; i < constituents.length; i++) {
            if (amounts[i] > maximum[i]) revert Slippage();
            IERC20 token = IERC20(constituents[i]); uint256 beforeBalance = token.balanceOf(address(this));
            token.safeTransferFrom(msg.sender, address(this), amounts[i]);
            if (token.balanceOf(address(this)) - beforeBalance != amounts[i]) revert ShortTransfer();
        }
        _mint(msg.sender, shares); emit Created(msg.sender, shares, amounts);
    }
    function redeem(uint256 shares, uint256[] calldata minimum) external nonReentrant {
        if (shares == 0 || shares > balanceOf(msg.sender) || minimum.length != constituents.length) revert InvalidAmount();
        (,uint256[] memory amounts) = quote(shares);
        _burn(msg.sender, shares);
        for (uint256 i; i < constituents.length; i++) {
            if (amounts[i] < minimum[i]) revert Slippage();
            IERC20(constituents[i]).safeTransfer(msg.sender, amounts[i]);
        }
        emit Redeemed(msg.sender, shares, amounts);
    }
}
