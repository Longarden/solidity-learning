import hre from "hardhat";
import { expect } from "chai";
import { MyToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

const mintingAmount = 100n;
const decimal = 18n;

describe("MyToken", () => {
    let myTokenC: MyToken;
    let signers: HardhatEthersSigner[];
    beforeEach("should deploy", async () => {
        signers = await hre.ethers.getSigners();
        myTokenC = await hre.ethers.deployContract("MyToken", [
            "MyToken",
            "MT",
            decimal,
            mintingAmount
        ]);
    });
    describe("Basic state value check", () => {
        it("should return name", async () => {
            expect(await myTokenC.name()).to.equal("MyToken");
        });
        it("should return symbol", async () => {
            expect(await myTokenC.symbol()).to.equal("MT");
        });
        it("should return decimals", async () => {
            expect(await myTokenC.decimals()).to.equal(decimal);
        });
        it("should return 100 totalSupply", async () => {
            expect(await myTokenC.totalSupply()).to.equal(mintingAmount * 10n ** decimal);
        });
    });
    describe("Mint", () => {
        it("should return 1MT balance for signer 0", async () => {
            const signer0 = signers[0];
            expect(await myTokenC.balanceOf(signer0)).equal(mintingAmount * 10n ** decimal);
        });

        it("should return or revert when minting infinitly", async () => {
            const hacker = signers[2];
            const mintingAgainAmount = hre.ethers.parseUnits("10000", decimal);
            await expect(myTokenC.connect(hacker).mint(mintingAgainAmount, hacker.address)).to.be.revertedWith("You are not manageble this token");
        });
    })

    describe("Transfer", () => {
        it("shoud have 0.5MT", async () => {
            const signer0 = signers[0];
            const signer1 = signers[1];
            expect(
                await myTokenC.transfer(hre.ethers.parseUnits("0.5", decimal), signer1.address)
            )
            .to.emit(myTokenC, "Transfer")
            .withArgs(signer0.address, signer1.address, hre.ethers.parseUnits("0.5", decimal));

            expect(await myTokenC.balanceOf(signer1.address)).equal(
                hre.ethers.parseUnits("0.5", decimal)
            );
        });

        it("shoud be reverted with insufficient balance error", async () => {
            const signer1 = signers[1];
            await expect(myTokenC.transfer(hre.ethers.parseUnits((mintingAmount + 1n).toString(), decimal), signer1.address)).to.be.revertedWith("insufficient balance");
        });
    })
    describe("TransferFrom", () => {
        it("should emit Approval event", async () => {
            const signer1 = signers[1];
            await expect(myTokenC.approve(signer1.address, hre.ethers.parseUnits("10", decimal)))
            .to.emit(myTokenC, "Approval")
            .withArgs(signer1.address, hre.ethers.parseUnits("10", decimal));
        });
        it("should be reverted with insufficient allowance error", async () => {
            const signer0 = signers[0];
            const signer1 = signers[1];
            await expect(myTokenC.connect(signer1).transferFrom(signer0.address, signer1.address, hre.ethers.parseUnits("1", decimal))).to.be.revertedWith("insufficient allowance");
        });
    })
})
