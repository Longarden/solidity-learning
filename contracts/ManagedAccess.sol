// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

abstract contract ManagedAccess {
    // --- Single owner/manager (MyToken용) ---
    address public owner;
    address public manager;

    constructor(address _owner, address _manager) {
        owner = _owner;
        manager = _manager;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not authorized");
        _;
    }

    modifier onlyManager() {
        require(
            msg.sender == manager,
            "You are not manageble this token"
        );
        _;
    }
    // ----------------------------------------

    // --- Multi-manager / onlyAllConfirmed (TinyBank용) ---
    address[] public managers;
    mapping(address => bool) public isManager;
    mapping(address => bool) public hasConfirmed;
    uint256 public confirmCount;

    function _addManager(address _mgr) internal {
        require(!isManager[_mgr], "Already a manager");
        managers.push(_mgr);
        isManager[_mgr] = true;
    }

    function confirm() external {
        require(isManager[msg.sender], "You are not a manager");
        if (!hasConfirmed[msg.sender]) {
            hasConfirmed[msg.sender] = true;
            confirmCount++;
        }
    }

    modifier onlyAllConfirmed() {
        require(isManager[msg.sender], "You are not a manager");
        require(confirmCount == managers.length, "Not all confirmed yet");
        for (uint256 i = 0; i < managers.length; i++) {
            hasConfirmed[managers[i]] = false;
        }
        confirmCount = 0;
        _;
    }
    // -----------------------------------------------------
}
