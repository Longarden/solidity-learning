import { expect } from "chai";
import { MyToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import hre from "hardhat";

const mintingAmount = 100n;
const decimals = 18n;

describe("My Token", () => {
  let myTokenC: MyToken;
  let signers: HardhatEthersSigner[];

  beforeEach("should deploy", async () => {
    signers = await hre.ethers.getSigners();
    myTokenC = await hre.ethers.deployContract("MyToken", [
      "MyToken",
      "MT",
      decimals,
      mintingAmount,
    ]);
  });

  describe("Basic state value check", () => {
    it("should return name", async () => {
      expect(await myTokenC.name()).equal("MyToken");
    });
    it("should return symbol", async () => {
      expect(await myTokenC.symbol()).equal("MT");
    });
    it("should return decimals", async () => {
      expect(await myTokenC.decimals()).equal(decimals);
    });
    it("should return 100 totalSupply", async () => {
      expect(await myTokenC.totalSupply()).equal(
        mintingAmount * 10n ** decimals
      );
    });
  });

  describe("Mint", () => {
    it("should return 1MT balance for signer 0", async () => {
      expect(await myTokenC.balanceOf(signers[0].address)).to.equal(
        mintingAmount * 10n ** decimals
      );
    });
  });

  describe("Transfer", () => {
    it("shoud have 0.5MT", async () => {
      const sendAmount = hre.ethers.parseUnits("0.5", decimals);
      await myTokenC.transfer(sendAmount, signers[1].address);
      expect(await myTokenC.balanceOf(signers[1].address)).to.equal(sendAmount);
    });

    it("shoud be reverted with insufficient balance error", async () => {
      const overAmount = (mintingAmount + 1n) * 10n ** decimals; // 101 MT
      await expect(
        myTokenC.transfer(overAmount, signers[1].address)
      ).to.be.revertedWith("insufficient balance");
    });
  });

  describe("TransferFrom", () => {
    it("should emit Approval event", async () => {
      const signer1 = signers[1];
      await expect(
        myTokenC.approve(signer1.address, hre.ethers.parseUnits("10", decimals))
      )
        .to.emit(myTokenC, "Approval")
        .withArgs(
          signers[0].address,
          signer1.address,
          hre.ethers.parseUnits("10", decimals)
        );
    });

    it("should be reverted with insufficient allowance error", async () => {
      const signer0 = signers[0];
      const signer1 = signers[1];
      await expect(
        myTokenC
          .connect(signer1)
          .transferFrom(
            signer0.address,
            signer1.address,
            hre.ethers.parseUnits("1", decimals)
          )
      ).to.be.revertedWith("insufficient allowance");
    });
  });
});
