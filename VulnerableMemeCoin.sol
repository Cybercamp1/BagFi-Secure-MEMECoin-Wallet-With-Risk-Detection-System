// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VulnerableMemeCoin is ERC20, Ownable {
    mapping(address => bool) public isBlacklisted;
    uint256 public buyTax = 5; // 5% buy tax
    uint256 public sellTax = 99; // 99% sell tax - Honeypot risk indicator for Risk Detector
    
    constructor(address initialOwner) ERC20("VulnerableMoon", "VMOON") Ownable(initialOwner) {
        _mint(msg.sender, 1000000000 * 10 ** decimals());
    }

    // Access control vulnerability: Blacklist can be modified by owner (Centralization Risk)
    function blacklistUser(address user) public onlyOwner {
        isBlacklisted[user] = true;
    }

    function removeBlacklist(address user) public onlyOwner {
        isBlacklisted[user] = false;
    }

    // Overriding transfer to include tax and blacklist mechanism
    function transfer(address to, uint256 value) public virtual override returns (bool) {
        require(!isBlacklisted[msg.sender], "Sender is blacklisted");
        require(!isBlacklisted[to], "Receiver is blacklisted");
        
        uint256 taxAmount = 0;
        // Simple honeypot-like tax collection mechanism
        if (msg.sender != owner() && to != owner()) {
            taxAmount = (value * sellTax) / 100;
            if (taxAmount > 0) {
                super.transfer(owner(), taxAmount);
            }
        }
        
        return super.transfer(to, value - taxAmount);
    }
    
    function transferFrom(address from, address to, uint256 value) public virtual override returns (bool) {
        require(!isBlacklisted[from], "Sender is blacklisted");
        require(!isBlacklisted[to], "Receiver is blacklisted");
        
        uint256 taxAmount = 0;
        if (from != owner() && to != owner()) {
            taxAmount = (value * sellTax) / 100;
            if (taxAmount > 0) {
                super.transferFrom(from, owner(), taxAmount);
            }
        }
        
        return super.transferFrom(from, to, value - taxAmount);
    }
    
    // ============================================
    // Vulnerability: Reentrancy Pattern
    // ============================================
    mapping(address => uint256) public deposits;
    
    // Function simulates an ecosystem staking withdrawal vulnerable to reentrancy
    function withdraw() public {
        uint256 bal = deposits[msg.sender];
        require(bal > 0, "No balance to withdraw");
        
        // External call before state update - REENTRANCY VULNERABILITY
        (bool sent, ) = msg.sender.call{value: bal}("");
        require(sent, "Failed to send Ether");
        
        // State update happens after the external call
        deposits[msg.sender] = 0; 
    }
    
    function deposit() public payable {
        deposits[msg.sender] += msg.value;
    }
}
