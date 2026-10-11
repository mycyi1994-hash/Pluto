const { expect } = require('chai');
const { ethers } = require('hardhat');
async function fixture() {
  const [owner, other] = await ethers.getSigners();
  const Token = await ethers.getContractFactory('PlutoDemoStock');
  const tokens = [await Token.deploy('AAPL'), await Token.deploy('MSFT')];
  const units = [ethers.parseEther('0.08'), ethers.parseEther('0.04')];
  const Vault = await ethers.getContractFactory('PlutoBasket');
  const vault = await Vault.deploy('Pluto Core', 'PLUTO', await Promise.all(tokens.map(t => t.getAddress())), units);
  for (const token of tokens) for (const account of [owner, other]) { await token.connect(account).faucet(); await token.connect(account).approve(await vault.getAddress(), ethers.MaxUint256); }
  return { owner, other, tokens, vault, units, Vault };
}
describe('Pluto collateral invariants', () => {
  it('creates and redeems exact raw collateral, including final dust', async () => {
    const { vault, tokens, units } = await fixture();
    await vault.create(1000000n, units); expect(await vault.totalSupply()).eq(1000000n);
    await vault.redeem(333333n, [0, 0]); await vault.redeem(666667n, [0, 0]);
    for (const t of tokens) expect(await t.balanceOf(await vault.getAddress())).eq(0);
  });
  it('corporate action changes display exposure without double-minting raw tokens', async () => {
    const { vault, tokens, units } = await fixture(); await vault.create(1000000, units);
    await tokens[0].setMultiplier(ethers.parseEther('2')); expect((await vault.quote(1000000))[1][0]).eq(units[0]);
    await vault.redeem(1000000, units); expect(await vault.totalSupply()).eq(0);
  });
  it('donations belong to holders; a later creator must pay a fair proportion', async () => {
    const { vault, tokens, units, other } = await fixture(); await vault.create(1000000, units);
    await tokens[0].transfer(await vault.getAddress(), units[0]);
    await expect(vault.connect(other).create(1000000, units)).revertedWithCustomError(vault, 'Slippage');
    const q = await vault.quote(1000000); await vault.connect(other).create(1000000, Array.from(q[0]));
    expect(await tokens[0].balanceOf(await vault.getAddress())).eq(units[0] * 4n);
  });
  it('rejects duplicate constituents, dust first deposits and withdrawals by nonholders', async () => {
    const { vault, Vault, tokens, units, other } = await fixture(); const address = await tokens[0].getAddress();
    await expect(Vault.deploy('x','x',[address,address],units)).revertedWithCustomError(Vault,'InvalidBasket');
    await expect(vault.create(1, units)).revertedWithCustomError(vault,'InvalidAmount');
    await expect(vault.connect(other).redeem(1000000,[0,0])).revertedWithCustomError(vault,'InvalidAmount');
  });
  it('rolls back burning shares on redemption slippage', async () => {
    const { vault, owner, units } = await fixture(); await vault.create(1000000, units);
    await expect(vault.redeem(1000000,[units[0]+1n,units[1]])).revertedWithCustomError(vault,'Slippage');
    expect(await vault.balanceOf(owner.address)).eq(1000000);
  });
});
