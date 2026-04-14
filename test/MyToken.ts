import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("MyToken - approve & transferFrom", function () {
  async function deployFixture() {
    const [signer0, signer1] = await hre.ethers.getSigners();
    const MyToken = await hre.ethers.getContractFactory("MyToken");
    const token = await MyToken.deploy("MyToken", "MT", 18, 1);
    return { token, signer0, signer1 };
  }

  it("signer1에 의한 signer0 자산 이동 (approve & transferFrom)", async function () {
    const { token, signer0, signer1 } = await loadFixture(deployFixture);

    const amount = hre.ethers.parseUnits("1", 18);
    const initialBalance = await token.balanceOf(signer0.address);

    // 1. approve: signer0 -> signer1에게 권한 부여
    await token.connect(signer0).approve(signer1.address, amount);
    expect(await token.allowance(signer0.address, signer1.address)).to.equal(amount);

    // 2. transferFrom: signer1이 signer0의 토큰을 signer1에게 이동
    await token.connect(signer1).transferFrom(signer0.address, signer1.address, amount);

    // 3. balance 확인
    expect(await token.balanceOf(signer0.address)).to.equal(initialBalance - amount);
    expect(await token.balanceOf(signer1.address)).to.equal(amount);
    expect(await token.allowance(signer0.address, signer1.address)).to.equal(0);
  });
});
