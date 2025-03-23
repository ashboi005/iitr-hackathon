// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract FreelanceContract {
    address public employer;
    address public freelancer;
    uint256 public milestoneAmount;
    uint256 public currentMilestone;

    mapping(uint256 => bool) public milestoneCompleted;

    constructor(address _freelancer, uint256 _milestoneAmount) {
        employer = msg.sender;  // The employer deploys the contract
        freelancer = _freelancer;
        milestoneAmount = _milestoneAmount;
        currentMilestone = 1;
    }

    // Employer pays for milestone 1
    function fundMilestone() public payable {
        require(msg.sender == employer, "Only employer can fund.");
        require(msg.value == milestoneAmount, "Incorrect amount.");
    }

    // Freelancer requests payment for a completed milestone
    function completeMilestone(uint256 milestone) public {
        require(msg.sender == freelancer, "Only freelancer can complete.");
        require(milestone == currentMilestone, "Incorrect milestone.");

        // Mark milestone as complete
        milestoneCompleted[milestone] = true;
    }

    // Employer approves the milestone
    function approveMilestone(uint256 milestone) public {
        require(msg.sender == employer, "Only employer can approve.");
        require(milestoneCompleted[milestone], "Milestone not completed.");

        // Release payment to freelancer
        payable(freelancer).transfer(milestoneAmount);
        currentMilestone++;  // Move to the next milestone
    }
}
