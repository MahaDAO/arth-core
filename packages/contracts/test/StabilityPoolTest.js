const deploymentHelper = require("../utils/deploymentHelpers.js");
const testHelpers = require("../utils/testHelpers.js");
const th = testHelpers.TestHelper;
const dec = th.dec;
const toBN = th.toBN;
const mv = testHelpers.MoneyValues;
const timeValues = testHelpers.TimeValues;

const TroveManagerTester = artifacts.require("TroveManagerTester");
const ARTHValuecoin = artifacts.require("ARTHValuecoin");
const NonPayable = artifacts.require("NonPayable.sol");

const ZERO = toBN("0");
const ZERO_ADDRESS = th.ZERO_ADDRESS;
const maxBytes32 = th.maxBytes32;

const GAS_PRICE = 10000000;

const getFrontEndTag = async (stabilityPool, depositor) => {
  return (await stabilityPool.deposits(depositor))[1];
};

contract("StabilityPool", async accounts => {
  const [
    owner,
    defaulter_1,
    defaulter_2,
    defaulter_3,
    whale,
    alice,
    bob,
    carol,
    dennis,
    erin,
    flyn,
    A,
    B,
    C,
    D,
    E,
    F,
    frontEnd_1,
    frontEnd_2,
    frontEnd_3,
    fund
  ] = accounts;

  const [bountyAddress, lpRewardsAddress, multisig] = accounts.slice(997, 1000);

  const frontEnds = [frontEnd_1, frontEnd_2, frontEnd_3];
  let contracts;
  let priceFeed;
  let arthToken;
  let sortedTroves;
  let troveManager;
  let activePool;
  let stabilityPool;
  let defaultPool;
  let borrowerOperations;
  let mahaToken;
  let communityIssuance;

  let gasPriceInWei;

  const getOpenTroveARTHAmount = async totalDebt => th.getOpenTroveARTHAmount(contracts, totalDebt);
  const openTrove = async params => th.openTrove(contracts, params);
  const assertRevert = th.assertRevert;

  describe("Stability Pool Mechanisms", async () => {
    before(async () => {
      gasPriceInWei = await web3.eth.getGasPrice();
    });

    beforeEach(async () => {
      contracts = await deploymentHelper.deployLiquityCore(owner, fund);
      contracts.troveManager = await TroveManagerTester.new();

      priceFeed = contracts.priceFeed;
      arthToken = contracts.arthToken;
      sortedTroves = contracts.sortedTroves;
      troveManager = contracts.troveManager;
      activePool = contracts.activePool;
      stabilityPool = contracts.stabilityPool;
      defaultPool = contracts.defaultPool;
      borrowerOperations = contracts.borrowerOperations;
      hintHelpers = contracts.hintHelpers;

      mahaToken = contracts.mahaToken;
      communityIssuance = contracts.communityIssuance;

      await deploymentHelper.connectCoreContracts(contracts);

      // Register 3 front ends
      await th.registerFrontEnds(frontEnds, stabilityPool);
    });

    // // --- provideToSP() ---
    // // increases recorded ARTH at Stability Pool
    // it("provideToSP(): increases the Stability Pool ARTH balance", async () => {
    //   // --- SETUP --- Give Alice a least 200
    //   await openTrove({
    //     extraARTHAmount: toBN(200),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: alice }
    //   });

    //   // --- TEST ---

    //   // provideToSP()
    //   await stabilityPool.provideToSP(200, ZERO_ADDRESS, { from: alice });

    //   // check ARTH balances after
    //   const stabilityPool_ARTH_After = await stabilityPool.getTotalARTHDeposits();
    //   assert.equal(stabilityPool_ARTH_After, 200);
    // });

    // it("provideToSP(): updates the user's deposit record in StabilityPool", async () => {
    //   // --- SETUP --- Give Alice a least 200
    //   await openTrove({
    //     extraARTHAmount: toBN(200),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: alice }
    //   });

    //   // --- TEST ---
    //   // check user's deposit record before
    //   const alice_depositRecord_Before = await stabilityPool.deposits(alice);
    //   assert.equal(alice_depositRecord_Before[0], 0);

    //   // provideToSP()
    //   await stabilityPool.provideToSP(200, frontEnd_1, { from: alice });

    //   // check user's deposit record after
    //   const alice_depositRecord_After = (await stabilityPool.deposits(alice))[0];
    //   assert.equal(alice_depositRecord_After, 200);
    // });

    // it("provideToSP(): reduces the user's ARTH balance by the correct amount", async () => {
    //   // --- SETUP --- Give Alice a least 200
    //   await openTrove({
    //     extraARTHAmount: toBN(200),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: alice }
    //   });

    //   // --- TEST ---
    //   // get user's deposit record before
    //   const alice_ARTHBalance_Before = await arthToken.balanceOf(alice);

    //   // provideToSP()
    //   await stabilityPool.provideToSP(200, frontEnd_1, { from: alice });

    //   // check user's ARTH balance change
    //   const alice_ARTHBalance_After = await arthToken.balanceOf(alice);
    //   assert.equal(alice_ARTHBalance_Before.sub(alice_ARTHBalance_After), "200");
    // });

    // it("provideToSP(): increases totalARTHDeposits by correct amount", async () => {
    //   // --- SETUP ---

    //   // Whale opens Trove with 50 ETH, adds 2000 ARTH to StabilityPool
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(2000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: whale }
    //   });
    //   await stabilityPool.provideToSP(dec(2000, 18), frontEnd_1, { from: whale });

    //   const totalARTHDeposits = await stabilityPool.getTotalARTHDeposits();
    //   assert.equal(totalARTHDeposits, dec(2000, 18));
    // });

    // it("provideToSP(): Correctly updates user snapshots of accumulated rewards per unit staked", async () => {
    //   // --- SETUP ---

    //   // Whale opens Trove and deposits to SP
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(10000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: whale, value: dec(50, "ether") }
    //   });
    //   const whaleARTH = await arthToken.balanceOf(whale);
    //   await stabilityPool.provideToSP(whaleARTH, frontEnd_1, { from: whale });

    //   // 2 Troves opened, each withdraws minimum debt
    //   await openTrove({
    //     extraARTHAmount: 0,
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: defaulter_1 }
    //   });
    //   await openTrove({
    //     extraARTHAmount: 0,
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: defaulter_2 }
    //   });

    //   // Alice makes Trove and withdraws 100 ARTH
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(100, 18)),
    //     ICR: toBN(dec(5, 18)),
    //     extraParams: { from: alice, value: dec(50, "ether") }
    //   });

    //   // price drops: defaulter's Troves fall below MCR, whale doesn't
    //   await priceFeed.setPrice(dec(105, 18));

    //   const SPARTH_Before = await stabilityPool.getTotalARTHDeposits();

    //   // Troves are closed
    //   await troveManager.liquidate(defaulter_1, { from: owner });
    //   await troveManager.liquidate(defaulter_2, { from: owner });
    //   assert.isFalse(await sortedTroves.contains(defaulter_1));
    //   assert.isFalse(await sortedTroves.contains(defaulter_2));

    //   // Confirm SP has decreased
    //   const SPARTH_After = await stabilityPool.getTotalARTHDeposits();
    //   assert.isTrue(SPARTH_After.lt(SPARTH_Before));

    //   // --- TEST ---
    //   const P_Before = await stabilityPool.P();
    //   const S_Before = await stabilityPool.epochToScaleToSum(0, 0);
    //   const G_Before = await stabilityPool.epochToScaleToG(0, 0);
    //   assert.isTrue(P_Before.gt(toBN("0")));
    //   assert.isTrue(S_Before.gt(toBN("0")));

    //   // Check 'Before' snapshots
    //   const alice_snapshot_Before = await stabilityPool.depositSnapshots(alice);
    //   const alice_snapshot_S_Before = alice_snapshot_Before[0].toString();
    //   const alice_snapshot_P_Before = alice_snapshot_Before[1].toString();
    //   const alice_snapshot_G_Before = alice_snapshot_Before[2].toString();
    //   assert.equal(alice_snapshot_S_Before, "0");
    //   assert.equal(alice_snapshot_P_Before, "0");
    //   assert.equal(alice_snapshot_G_Before, "0");

    //   // Make deposit
    //   await stabilityPool.provideToSP(dec(100, 18), frontEnd_1, { from: alice });

    //   // Check 'After' snapshots
    //   const alice_snapshot_After = await stabilityPool.depositSnapshots(alice);
    //   const alice_snapshot_S_After = alice_snapshot_After[0].toString();
    //   const alice_snapshot_P_After = alice_snapshot_After[1].toString();
    //   const alice_snapshot_G_After = alice_snapshot_After[2].toString();

    //   assert.equal(alice_snapshot_S_After, S_Before);
    //   assert.equal(alice_snapshot_P_After, P_Before);
    //   assert.equal(alice_snapshot_G_After, G_Before);
    // });

    // it("provideToSP(), multiple deposits: updates user's deposit and snapshots", async () => {
    //   // --- SETUP ---
    //   // Whale opens Trove and deposits to SP
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(10000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: whale, value: dec(50, "ether") }
    //   });
    //   const whaleARTH = await arthToken.balanceOf(whale);
    //   await stabilityPool.provideToSP(whaleARTH, frontEnd_1, { from: whale });

    //   // 3 Troves opened. Two users withdraw 160 ARTH each
    //   await openTrove({
    //     extraARTHAmount: 0,
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: defaulter_1, value: dec(50, "ether") }
    //   });
    //   await openTrove({
    //     extraARTHAmount: 0,
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: defaulter_2, value: dec(50, "ether") }
    //   });
    //   await openTrove({
    //     extraARTHAmount: 0,
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: defaulter_3, value: dec(50, "ether") }
    //   });

    //   // --- TEST ---

    //   // Alice makes deposit #1: 150 ARTH
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(250, 18)),
    //     ICR: toBN(dec(3, 18)),
    //     extraParams: { from: alice }
    //   });
    //   await stabilityPool.provideToSP(dec(150, 18), frontEnd_1, { from: alice });

    //   const alice_Snapshot_0 = await stabilityPool.depositSnapshots(alice);
    //   const alice_Snapshot_S_0 = alice_Snapshot_0[0];
    //   const alice_Snapshot_P_0 = alice_Snapshot_0[1];
    //   assert.equal(alice_Snapshot_S_0, 0);
    //   assert.equal(alice_Snapshot_P_0, "1000000000000000000");

    //   // price drops: defaulters' Troves fall below MCR, alice and whale Trove remain active
    //   await priceFeed.setPrice(dec(105, 18));

    //   // 2 users with Trove with 180 ARTH drawn are closed
    //   await troveManager.liquidate(defaulter_1, { from: owner }); // 180 ARTH closed
    //   await troveManager.liquidate(defaulter_2, { from: owner }); // 180 ARTH closed

    //   const alice_compoundedDeposit_1 = await stabilityPool.getCompoundedARTHDeposit(alice);

    //   // Alice makes deposit #2
    //   const alice_topUp_1 = toBN(dec(100, 18));
    //   await stabilityPool.provideToSP(alice_topUp_1, frontEnd_1, { from: alice });

    //   const alice_newDeposit_1 = (await stabilityPool.deposits(alice))[0].toString();
    //   assert.equal(alice_compoundedDeposit_1.add(alice_topUp_1), alice_newDeposit_1);

    //   // get system reward terms
    //   const P_1 = await stabilityPool.P();
    //   const S_1 = await stabilityPool.epochToScaleToSum(0, 0);
    //   assert.isTrue(P_1.lt(toBN(dec(1, 18))));
    //   assert.isTrue(S_1.gt(toBN("0")));

    //   // check Alice's new snapshot is correct
    //   const alice_Snapshot_1 = await stabilityPool.depositSnapshots(alice);
    //   const alice_Snapshot_S_1 = alice_Snapshot_1[0];
    //   const alice_Snapshot_P_1 = alice_Snapshot_1[1];
    //   assert.isTrue(alice_Snapshot_S_1.eq(S_1));
    //   assert.isTrue(alice_Snapshot_P_1.eq(P_1));

    //   // Bob withdraws ARTH and deposits to StabilityPool
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(1000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: bob }
    //   });

    //   await stabilityPool.provideToSP(dec(150, 18), frontEnd_1, { from: alice });

    //   // Defaulter 3 Trove is closed
    //   await troveManager.liquidate(defaulter_3, { from: owner });

    //   const alice_compoundedDeposit_2 = await stabilityPool.getCompoundedARTHDeposit(alice);

    //   const P_2 = await stabilityPool.P();
    //   const S_2 = await stabilityPool.epochToScaleToSum(0, 0);
    //   assert.isTrue(P_2.lt(P_1));
    //   assert.isTrue(S_2.gt(S_1));

    //   // Alice makes deposit #3:  100ARTH
    //   await stabilityPool.provideToSP(dec(100, 18), frontEnd_1, { from: alice });

    //   // check Alice's new snapshot is correct
    //   const alice_Snapshot_2 = await stabilityPool.depositSnapshots(alice);
    //   const alice_Snapshot_S_2 = alice_Snapshot_2[0];
    //   const alice_Snapshot_P_2 = alice_Snapshot_2[1];
    //   assert.isTrue(alice_Snapshot_S_2.eq(S_2));
    //   assert.isTrue(alice_Snapshot_P_2.eq(P_2));
    // });

    // it("provideToSP(): reverts if user tries to provide more than their ARTH balance", async () => {
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(10000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: whale, value: dec(50, "ether") }
    //   });

    //   await openTrove({
    //     extraARTHAmount: toBN(dec(10000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: alice, value: dec(50, "ether") }
    //   });
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(10000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: bob, value: dec(50, "ether") }
    //   });
    //   const aliceARTHbal = await arthToken.balanceOf(alice);
    //   const bobARTHbal = await arthToken.balanceOf(bob);

    //   // Alice, attempts to deposit 1 wei more than her balance

    //   const aliceTxPromise = stabilityPool.provideToSP(aliceARTHbal.add(toBN(1)), frontEnd_1, {
    //     from: alice
    //   });
    //   await assertRevert(aliceTxPromise, "revert");

    //   // Bob, attempts to deposit 235534 more than his balance

    //   const bobTxPromise = stabilityPool.provideToSP(
    //     bobARTHbal.add(toBN(dec(235534, 18))),
    //     frontEnd_1,
    //     { from: bob }
    //   );
    //   await assertRevert(bobTxPromise, "revert");
    // });

    // it("provideToSP(): reverts if user tries to provide 2^256-1 ARTH, which exceeds their balance", async () => {
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(10000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: whale, value: dec(50, "ether") }
    //   });
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(10000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: alice, value: dec(50, "ether") }
    //   });
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(10000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: bob, value: dec(50, "ether") }
    //   });

    //   const maxBytes32 = web3.utils.toBN(
    //     "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
    //   );

    //   // Alice attempts to deposit 2^256-1 ARTH
    //   try {
    //     aliceTx = await stabilityPool.provideToSP(maxBytes32, frontEnd_1, { from: alice });
    //     assert.isFalse(tx.receipt.status);
    //   } catch (error) {
    //     assert.include(error.message, "revert");
    //   }
    // });

    // it("provideToSP(): reverts if cannot receive ETH Gain", async () => {
    //   // --- SETUP ---
    //   // Whale deposits 1850 ARTH in StabilityPool
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(10000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: whale, value: dec(50, "ether") }
    //   });
    //   await stabilityPool.provideToSP(dec(1850, 18), frontEnd_1, { from: whale });

    //   // Defaulter Troves opened
    //   await openTrove({
    //     extraARTHAmount: 0,
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: defaulter_1 }
    //   });
    //   await openTrove({
    //     extraARTHAmount: 0,
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: defaulter_2 }
    //   });

    //   // --- TEST ---

    //   const nonPayable = await NonPayable.new();
    //   await arthToken.transfer(nonPayable.address, dec(250, 18), { from: whale });

    //   // NonPayable makes deposit #1: 150 ARTH
    //   const txData1 = th.getTransactionData("provideToSP(uint256,address)", [
    //     web3.utils.toHex(dec(150, 18)),
    //     frontEnd_1
    //   ]);
    //   const tx1 = await nonPayable.forward(stabilityPool.address, txData1);

    //   const gain_0 = await stabilityPool.getDepositorETHGain(nonPayable.address);
    //   assert.isTrue(gain_0.eq(toBN(0)), "NonPayable should not have accumulated gains");

    //   // price drops: defaulters' Troves fall below MCR, nonPayable and whale Trove remain active
    //   await priceFeed.setPrice(dec(105, 18));

    //   // 2 defaulters are closed
    //   await troveManager.liquidate(defaulter_1, { from: owner });
    //   await troveManager.liquidate(defaulter_2, { from: owner });

    //   const gain_1 = await stabilityPool.getDepositorETHGain(nonPayable.address);
    //   assert.isTrue(gain_1.gt(toBN(0)), "NonPayable should have some accumulated gains");

    //   // NonPayable tries to make deposit #2: 100ARTH (which also attempts to withdraw ETH gain)
    //   const txData2 = th.getTransactionData("provideToSP(uint256,address)", [
    //     web3.utils.toHex(dec(100, 18)),
    //     frontEnd_1
    //   ]);
    //   await th.assertRevert(
    //     nonPayable.forward(stabilityPool.address, txData2),
    //     "StabilityPool: sending ETH failed"
    //   );
    // });

    // it("provideToSP(): doesn't impact other users' deposits or ETH gains", async () => {
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(10000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: whale, value: dec(50, "ether") }
    //   });

    //   // A, B, C open troves and make Stability Pool deposits
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(1000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: alice }
    //   });
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(2000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: bob }
    //   });
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(3000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: carol }
    //   });

    //   await stabilityPool.provideToSP(dec(1000, 18), frontEnd_1, { from: alice });
    //   await stabilityPool.provideToSP(dec(2000, 18), frontEnd_1, { from: bob });
    //   await stabilityPool.provideToSP(dec(3000, 18), frontEnd_1, { from: carol });

    //   // D opens a trove
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(300, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: dennis }
    //   });

    //   // Would-be defaulters open troves
    //   await openTrove({
    //     extraARTHAmount: 0,
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: defaulter_1 }
    //   });
    //   await openTrove({
    //     extraARTHAmount: 0,
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: defaulter_2 }
    //   });

    //   // Price drops
    //   await priceFeed.setPrice(dec(105, 18));

    //   // Defaulters are liquidated
    //   await troveManager.liquidate(defaulter_1);
    //   await troveManager.liquidate(defaulter_2);
    //   assert.isFalse(await sortedTroves.contains(defaulter_1));
    //   assert.isFalse(await sortedTroves.contains(defaulter_2));

    //   const alice_ARTHDeposit_Before = (
    //     await stabilityPool.getCompoundedARTHDeposit(alice)
    //   ).toString();
    //   const bob_ARTHDeposit_Before = (await stabilityPool.getCompoundedARTHDeposit(bob)).toString();
    //   const carol_ARTHDeposit_Before = (
    //     await stabilityPool.getCompoundedARTHDeposit(carol)
    //   ).toString();

    //   const alice_ETHGain_Before = (await stabilityPool.getDepositorETHGain(alice)).toString();
    //   const bob_ETHGain_Before = (await stabilityPool.getDepositorETHGain(bob)).toString();
    //   const carol_ETHGain_Before = (await stabilityPool.getDepositorETHGain(carol)).toString();

    //   //check non-zero ARTH and ETHGain in the Stability Pool
    //   const ARTHinSP = await stabilityPool.getTotalARTHDeposits();
    //   const ETHinSP = await stabilityPool.getETH();
    //   assert.isTrue(ARTHinSP.gt(mv._zeroBN));
    //   assert.isTrue(ETHinSP.gt(mv._zeroBN));

    //   // D makes an SP deposit
    //   await stabilityPool.provideToSP(dec(550, 18), frontEnd_1, { from: dennis });
    //   assert.equal((await stabilityPool.getCompoundedARTHDeposit(dennis)).toString(), dec(550, 18));

    //   const alice_ARTHDeposit_After = (
    //     await stabilityPool.getCompoundedARTHDeposit(alice)
    //   ).toString();
    //   const bob_ARTHDeposit_After = (await stabilityPool.getCompoundedARTHDeposit(bob)).toString();
    //   const carol_ARTHDeposit_After = (
    //     await stabilityPool.getCompoundedARTHDeposit(carol)
    //   ).toString();

    //   const alice_ETHGain_After = (await stabilityPool.getDepositorETHGain(alice)).toString();
    //   const bob_ETHGain_After = (await stabilityPool.getDepositorETHGain(bob)).toString();
    //   const carol_ETHGain_After = (await stabilityPool.getDepositorETHGain(carol)).toString();

    //   // Check compounded deposits and ETH gains for A, B and C have not changed
    //   assert.equal(alice_ARTHDeposit_Before, alice_ARTHDeposit_After);
    //   assert.equal(bob_ARTHDeposit_Before, bob_ARTHDeposit_After);
    //   assert.equal(carol_ARTHDeposit_Before, carol_ARTHDeposit_After);

    //   assert.equal(alice_ETHGain_Before, alice_ETHGain_After);
    //   assert.equal(bob_ETHGain_Before, bob_ETHGain_After);
    //   assert.equal(carol_ETHGain_Before, carol_ETHGain_After);
    // });

    // it("provideToSP(): doesn't impact system debt, collateral or TCR", async () => {
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(10000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: whale, value: dec(50, "ether") }
    //   });

    //   // A, B, C open troves and make Stability Pool deposits
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(1000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: alice }
    //   });
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(2000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: bob }
    //   });
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(3000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: carol }
    //   });

    //   await stabilityPool.provideToSP(dec(1000, 18), frontEnd_1, { from: alice });
    //   await stabilityPool.provideToSP(dec(2000, 18), frontEnd_1, { from: bob });
    //   await stabilityPool.provideToSP(dec(3000, 18), frontEnd_1, { from: carol });

    //   // D opens a trove
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(3000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: dennis }
    //   });

    //   // Would-be defaulters open troves
    //   await openTrove({
    //     extraARTHAmount: 0,
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: defaulter_1 }
    //   });
    //   await openTrove({
    //     extraARTHAmount: 0,
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: defaulter_2 }
    //   });

    //   // Price drops
    //   await priceFeed.setPrice(dec(105, 18));

    //   // Defaulters are liquidated
    //   await troveManager.liquidate(defaulter_1);
    //   await troveManager.liquidate(defaulter_2);
    //   assert.isFalse(await sortedTroves.contains(defaulter_1));
    //   assert.isFalse(await sortedTroves.contains(defaulter_2));

    //   const activeDebt_Before = (await activePool.getARTHDebt()).toString();
    //   const defaultedDebt_Before = (await defaultPool.getARTHDebt()).toString();
    //   const activeColl_Before = (await activePool.getETH()).toString();
    //   const defaultedColl_Before = (await defaultPool.getETH()).toString();
    //   const TCR_Before = (await th.getTCR(contracts)).toString();

    //   // D makes an SP deposit
    //   await stabilityPool.provideToSP(dec(1000, 18), frontEnd_1, { from: dennis });
    //   assert.equal((await stabilityPool.getCompoundedARTHDeposit(dennis)).toString(), dec(1000, 18));

    //   const activeDebt_After = (await activePool.getARTHDebt()).toString();
    //   const defaultedDebt_After = (await defaultPool.getARTHDebt()).toString();
    //   const activeColl_After = (await activePool.getETH()).toString();
    //   const defaultedColl_After = (await defaultPool.getETH()).toString();
    //   const TCR_After = (await th.getTCR(contracts)).toString();

    //   // Check total system debt, collateral and TCR have not changed after a Stability deposit is made
    //   assert.equal(activeDebt_Before, activeDebt_After);
    //   assert.equal(defaultedDebt_Before, defaultedDebt_After);
    //   assert.equal(activeColl_Before, activeColl_After);
    //   assert.equal(defaultedColl_Before, defaultedColl_After);
    //   assert.equal(TCR_Before, TCR_After);
    // });

    // it("provideToSP(): doesn't impact any troves, including the caller's trove", async () => {
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(10000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: whale, value: dec(50, "ether") }
    //   });

    //   // A, B, C open troves and make Stability Pool deposits
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(1000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: alice }
    //   });
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(2000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: bob }
    //   });
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(3000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: carol }
    //   });

    //   // A and B provide to SP
    //   await stabilityPool.provideToSP(dec(1000, 18), frontEnd_1, { from: alice });
    //   await stabilityPool.provideToSP(dec(2000, 18), frontEnd_1, { from: bob });

    //   // D opens a trove
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(1000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: dennis }
    //   });

    //   // Price drops
    //   await priceFeed.setPrice(dec(105, 18));
    //   const price = await priceFeed.getPrice();

    //   // Get debt, collateral and ICR of all existing troves
    //   const whale_Debt_Before = (await troveManager.Troves(whale))[0].toString();
    //   const alice_Debt_Before = (await troveManager.Troves(alice))[0].toString();
    //   const bob_Debt_Before = (await troveManager.Troves(bob))[0].toString();
    //   const carol_Debt_Before = (await troveManager.Troves(carol))[0].toString();
    //   const dennis_Debt_Before = (await troveManager.Troves(dennis))[0].toString();

    //   const whale_Coll_Before = (await troveManager.Troves(whale))[1].toString();
    //   const alice_Coll_Before = (await troveManager.Troves(alice))[1].toString();
    //   const bob_Coll_Before = (await troveManager.Troves(bob))[1].toString();
    //   const carol_Coll_Before = (await troveManager.Troves(carol))[1].toString();
    //   const dennis_Coll_Before = (await troveManager.Troves(dennis))[1].toString();

    //   const whale_ICR_Before = (await troveManager.getCurrentICR(whale, price)).toString();
    //   const alice_ICR_Before = (await troveManager.getCurrentICR(alice, price)).toString();
    //   const bob_ICR_Before = (await troveManager.getCurrentICR(bob, price)).toString();
    //   const carol_ICR_Before = (await troveManager.getCurrentICR(carol, price)).toString();
    //   const dennis_ICR_Before = (await troveManager.getCurrentICR(dennis, price)).toString();

    //   // D makes an SP deposit
    //   await stabilityPool.provideToSP(dec(1000, 18), frontEnd_1, { from: dennis });
    //   assert.equal((await stabilityPool.getCompoundedARTHDeposit(dennis)).toString(), dec(1000, 18));

    //   const whale_Debt_After = (await troveManager.Troves(whale))[0].toString();
    //   const alice_Debt_After = (await troveManager.Troves(alice))[0].toString();
    //   const bob_Debt_After = (await troveManager.Troves(bob))[0].toString();
    //   const carol_Debt_After = (await troveManager.Troves(carol))[0].toString();
    //   const dennis_Debt_After = (await troveManager.Troves(dennis))[0].toString();

    //   const whale_Coll_After = (await troveManager.Troves(whale))[1].toString();
    //   const alice_Coll_After = (await troveManager.Troves(alice))[1].toString();
    //   const bob_Coll_After = (await troveManager.Troves(bob))[1].toString();
    //   const carol_Coll_After = (await troveManager.Troves(carol))[1].toString();
    //   const dennis_Coll_After = (await troveManager.Troves(dennis))[1].toString();

    //   const whale_ICR_After = (await troveManager.getCurrentICR(whale, price)).toString();
    //   const alice_ICR_After = (await troveManager.getCurrentICR(alice, price)).toString();
    //   const bob_ICR_After = (await troveManager.getCurrentICR(bob, price)).toString();
    //   const carol_ICR_After = (await troveManager.getCurrentICR(carol, price)).toString();
    //   const dennis_ICR_After = (await troveManager.getCurrentICR(dennis, price)).toString();

    //   assert.equal(whale_Debt_Before, whale_Debt_After);
    //   assert.equal(alice_Debt_Before, alice_Debt_After);
    //   assert.equal(bob_Debt_Before, bob_Debt_After);
    //   assert.equal(carol_Debt_Before, carol_Debt_After);
    //   assert.equal(dennis_Debt_Before, dennis_Debt_After);

    //   assert.equal(whale_Coll_Before, whale_Coll_After);
    //   assert.equal(alice_Coll_Before, alice_Coll_After);
    //   assert.equal(bob_Coll_Before, bob_Coll_After);
    //   assert.equal(carol_Coll_Before, carol_Coll_After);
    //   assert.equal(dennis_Coll_Before, dennis_Coll_After);

    //   assert.equal(whale_ICR_Before, whale_ICR_After);
    //   assert.equal(alice_ICR_Before, alice_ICR_After);
    //   assert.equal(bob_ICR_Before, bob_ICR_After);
    //   assert.equal(carol_ICR_Before, carol_ICR_After);
    //   assert.equal(dennis_ICR_Before, dennis_ICR_After);
    // });

    // it("provideToSP(): doesn't protect the depositor's trove from liquidation", async () => {
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(10000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: whale, value: dec(50, "ether") }
    //   });

    //   // A, B, C open troves and make Stability Pool deposits
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(1000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: alice }
    //   });
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(2000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: bob }
    //   });
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(3000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: carol }
    //   });

    //   // A, B provide 100 ARTH to SP
    //   await stabilityPool.provideToSP(dec(1000, 18), frontEnd_1, { from: alice });
    //   await stabilityPool.provideToSP(dec(1000, 18), frontEnd_1, { from: bob });

    //   // Confirm Bob has an active trove in the system
    //   assert.isTrue(await sortedTroves.contains(bob));
    //   assert.equal((await troveManager.getTroveStatus(bob)).toString(), "1"); // Confirm Bob's trove status is active

    //   // Confirm Bob has a Stability deposit
    //   assert.equal((await stabilityPool.getCompoundedARTHDeposit(bob)).toString(), dec(1000, 18));

    //   // Price drops
    //   await priceFeed.setPrice(dec(105, 18));
    //   const price = await priceFeed.getPrice();

    //   // Liquidate bob
    //   await troveManager.liquidate(bob);

    //   // Check Bob's trove has been removed from the system
    //   assert.isFalse(await sortedTroves.contains(bob));
    //   assert.equal((await troveManager.getTroveStatus(bob)).toString(), "3"); // check Bob's trove status was closed by liquidation
    // });

    // it("provideToSP(): providing 0 ARTH reverts", async () => {
    //   // --- SETUP ---
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(10000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: whale, value: dec(50, "ether") }
    //   });

    //   // A, B, C open troves and make Stability Pool deposits
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(1000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: alice }
    //   });
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(2000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: bob }
    //   });
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(3000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: carol }
    //   });

    //   // A, B, C provides 100, 50, 30 ARTH to SP
    //   await stabilityPool.provideToSP(dec(100, 18), frontEnd_1, { from: alice });
    //   await stabilityPool.provideToSP(dec(50, 18), frontEnd_1, { from: bob });
    //   await stabilityPool.provideToSP(dec(30, 18), frontEnd_1, { from: carol });

    //   const bob_Deposit_Before = (await stabilityPool.getCompoundedARTHDeposit(bob)).toString();
    //   const ARTHinSP_Before = (await stabilityPool.getTotalARTHDeposits()).toString();

    //   assert.equal(ARTHinSP_Before, dec(180, 18));

    //   // Bob provides 0 ARTH to the Stability Pool
    //   const txPromise_B = stabilityPool.provideToSP(0, frontEnd_1, { from: bob });
    //   await th.assertRevert(txPromise_B);
    // });

    // it("provideToSP(), new deposit: when SP is empty, doesn't update G", async () => {
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(10000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: whale, value: dec(50, "ether") }
    //   });

    //   // A, B, C open troves and make Stability Pool deposits
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(1000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: A }
    //   });
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(2000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: B }
    //   });
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(3000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: C }
    //   });

    //   // A provides to SP
    //   await stabilityPool.provideToSP(dec(1000, 18), frontEnd_1, { from: A });

    //   await th.fastForwardTime(timeValues.SECONDS_IN_ONE_HOUR, web3.currentProvider);

    //   // A withdraws
    //   await stabilityPool.withdrawFromSP(dec(1000, 18), { from: A });

    //   // Check SP is empty
    //   assert.equal(await stabilityPool.getTotalARTHDeposits(), "0");

    //   // Check G is non-zero
    //   let currentEpoch = await stabilityPool.currentEpoch();
    //   let currentScale = await stabilityPool.currentScale();
    //   const G_Before = await stabilityPool.epochToScaleToG(currentEpoch, currentScale);
    //   assert.isFalse(G_Before.gt(toBN("0")));

    //   await th.fastForwardTime(timeValues.SECONDS_IN_ONE_HOUR, web3.currentProvider);

    //   // B provides to SP
    //   await stabilityPool.provideToSP(dec(1000, 18), frontEnd_1, { from: B });

    //   currentEpoch = await stabilityPool.currentEpoch();
    //   currentScale = await stabilityPool.currentScale();
    //   const G_After = await stabilityPool.epochToScaleToG(currentEpoch, currentScale);

    //   // Expect G has not changed
    //   assert.isTrue(G_After.eq(G_Before));
    // });

    // it("provideToSP(), new deposit: sets the correct front end tag", async () => {
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(10000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: whale, value: dec(50, "ether") }
    //   });

    //   // A, B, C, D open troves and make Stability Pool deposits
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(1000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: A }
    //   });
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(2000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: B }
    //   });
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(3000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: C }
    //   });
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(3000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: D }
    //   });

    //   // Check A, B, C D have no front end tags
    //   const A_tagBefore = await getFrontEndTag(stabilityPool, A);
    //   const B_tagBefore = await getFrontEndTag(stabilityPool, B);
    //   const C_tagBefore = await getFrontEndTag(stabilityPool, C);
    //   const D_tagBefore = await getFrontEndTag(stabilityPool, D);

    //   assert.equal(A_tagBefore, ZERO_ADDRESS);
    //   assert.equal(B_tagBefore, ZERO_ADDRESS);
    //   assert.equal(C_tagBefore, ZERO_ADDRESS);
    //   assert.equal(D_tagBefore, ZERO_ADDRESS);

    //   // A, B, C, D provides to SP
    //   await stabilityPool.provideToSP(dec(1000, 18), frontEnd_1, { from: A });
    //   await stabilityPool.provideToSP(dec(2000, 18), frontEnd_2, { from: B });
    //   await stabilityPool.provideToSP(dec(3000, 18), frontEnd_3, { from: C });
    //   await stabilityPool.provideToSP(dec(3200, 18), ZERO_ADDRESS, { from: D }); // transacts directly, no front end

    //   // Check A, B, C D have no front end tags
    //   const A_tagAfter = await getFrontEndTag(stabilityPool, A);
    //   const B_tagAfter = await getFrontEndTag(stabilityPool, B);
    //   const C_tagAfter = await getFrontEndTag(stabilityPool, C);
    //   const D_tagAfter = await getFrontEndTag(stabilityPool, D);

    //   // Check front end tags are correctly set
    //   assert.equal(A_tagAfter, frontEnd_1);
    //   assert.equal(B_tagAfter, frontEnd_2);
    //   assert.equal(C_tagAfter, frontEnd_3);
    //   assert.equal(D_tagAfter, ZERO_ADDRESS);
    // });

    // it("provideToSP(), new eligible deposit: tagged front end's stake increases", async () => {
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(10000, 18)),
    //     ICR: toBN(dec(10, 18)),
    //     extraParams: { from: whale }
    //   });

    //   // A, B, C, open troves
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(1000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: A }
    //   });
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(2000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: B }
    //   });
    //   await openTrove({
    //     extraARTHAmount: toBN(dec(3000, 18)),
    //     ICR: toBN(dec(2, 18)),
    //     extraParams: { from: C }
    //   });

    //   // Get front ends' stakes before
    //   const F1_Stake_Before = await stabilityPool.frontEndStakes(frontEnd_1);
    //   const F2_Stake_Before = await stabilityPool.frontEndStakes(frontEnd_2);
    //   const F3_Stake_Before = await stabilityPool.frontEndStakes(frontEnd_3);

    //   const deposit_A = dec(1000, 18);
    //   const deposit_B = dec(2000, 18);
    //   const deposit_C = dec(3000, 18);

    //   // A, B, C provide to SP
    //   await stabilityPool.provideToSP(deposit_A, frontEnd_1, { from: A });
    //   await stabilityPool.provideToSP(deposit_B, frontEnd_2, { from: B });
    //   await stabilityPool.provideToSP(deposit_C, frontEnd_3, { from: C });

    //   // Get front ends' stakes after
    //   const F1_Stake_After = await stabilityPool.frontEndStakes(frontEnd_1);
    //   const F2_Stake_After = await stabilityPool.frontEndStakes(frontEnd_2);
    //   const F3_Stake_After = await stabilityPool.frontEndStakes(frontEnd_3);

    //   const F1_Diff = F1_Stake_After.sub(F1_Stake_Before);
    //   const F2_Diff = F2_Stake_After.sub(F2_Stake_Before);
    //   const F3_Diff = F3_Stake_After.sub(F3_Stake_Before);

    //   // Check front ends' stakes have increased by amount equal to the deposit made through them
    //   assert.equal(F1_Diff, deposit_A);
    //   assert.equal(F2_Diff, deposit_B);
    //   assert.equal(F3_Diff, deposit_C);
    // });

    it("provideToSP(), new eligible deposit: tagged front end's snapshots update", async () => {
      await openTrove({
        extraARTHAmount: toBN(dec(10000, 18)),
        ICR: toBN(dec(10, 18)),
        extraParams: { from: whale }
      });

      // A, B, C, open troves
      await openTrove({
        extraARTHAmount: toBN(dec(1000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: A }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(2000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: B }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(3000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: C }
      });

      // D opens trove
      await openTrove({
        extraARTHAmount: toBN(dec(4000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: D }
      });

      await openTrove({ ICR: toBN(dec(2, 18)), extraParams: { from: defaulter_1 } });

      // --- SETUP ---

      await stabilityPool.provideToSP(dec(2000, 18), ZERO_ADDRESS, { from: D });

      // fastforward time then  make an SP deposit, to make G > 0
      await th.fastForwardTime(timeValues.SECONDS_IN_ONE_HOUR, web3.currentProvider);
      await stabilityPool.provideToSP(dec(2000, 18), ZERO_ADDRESS, { from: D });

      // Perform a liquidation to make 0 < P < 1, and S > 0
      await priceFeed.setPrice(dec(105, 18));
      assert.isFalse(await th.checkRecoveryMode(contracts));

      await troveManager.liquidate(defaulter_1);

      const currentEpoch = await stabilityPool.currentEpoch();
      const currentScale = await stabilityPool.currentScale();

      const S_Before = await stabilityPool.epochToScaleToSum(currentEpoch, currentScale);
      const P_Before = await stabilityPool.P();
      const G_Before = await stabilityPool.epochToScaleToG(currentEpoch, currentScale);

      // Confirm 0 < P < 1
      assert.isTrue(P_Before.gt(toBN("0")) && P_Before.lt(toBN(dec(1, 18))));
      // Confirm S, G are both > 0
      assert.isTrue(S_Before.gt(toBN("0")));
      assert.isFalse(G_Before.gt(toBN("0")));

      // Get front ends' snapshots before
      for (frontEnd of [frontEnd_1, frontEnd_2, frontEnd_3]) {
        const snapshot = await stabilityPool.frontEndSnapshots(frontEnd);

        assert.equal(snapshot[0], "0"); // S (should always be 0 for front ends, since S corresponds to ETH gain)
        assert.equal(snapshot[1], "0"); // P
        assert.equal(snapshot[2], "0"); // G
        assert.equal(snapshot[3], "0"); // scale
        assert.equal(snapshot[4], "0"); // epoch
      }

      const deposit_A = dec(1000, 18);
      const deposit_B = dec(2000, 18);
      const deposit_C = dec(3000, 18);

      // --- TEST ---

      // A, B, C provide to SP
      const G1 = await stabilityPool.epochToScaleToG(currentScale, currentEpoch);
      await stabilityPool.provideToSP(deposit_A, frontEnd_1, { from: A });

      const G2 = await stabilityPool.epochToScaleToG(currentScale, currentEpoch);
      await stabilityPool.provideToSP(deposit_B, frontEnd_2, { from: B });

      const G3 = await stabilityPool.epochToScaleToG(currentScale, currentEpoch);
      await stabilityPool.provideToSP(deposit_C, frontEnd_3, { from: C });

      const frontEnds = [frontEnd_1, frontEnd_2, frontEnd_3];
      const G_Values = [G1, G2, G3];

      // Map frontEnds to the value of G at time the deposit was made
      frontEndToG = th.zipToObject(frontEnds, G_Values);

      // Get front ends' snapshots after
      for (const [frontEnd, G] of Object.entries(frontEndToG)) {
        const snapshot = await stabilityPool.frontEndSnapshots(frontEnd);

        // Check snapshots are the expected values
        assert.equal(snapshot[0], "0"); // S (should always be 0 for front ends)
        assert.isTrue(snapshot[1].eq(P_Before)); // P
        assert.isTrue(snapshot[2].eq(G)); // G
        assert.equal(snapshot[3], "0"); // scale
        assert.equal(snapshot[4], "0"); // epoch
      }
    });

    it("provideToSP(), new deposit: depositor does not receive ETH gains", async () => {
      await openTrove({
        extraARTHAmount: toBN(dec(10000, 18)),
        ICR: toBN(dec(10, 18)),
        extraParams: { from: whale }
      });

      // Whale transfers ARTH to A, B
      await arthToken.transfer(A, dec(100, 18), { from: whale });
      await arthToken.transfer(B, dec(200, 18), { from: whale });

      // C, D open troves
      await openTrove({
        extraARTHAmount: toBN(dec(1000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: C }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(2000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: D }
      });

      // --- TEST ---

      // get current ETH balances
      const A_ETHBalance_Before = await web3.eth.getBalance(A);
      const B_ETHBalance_Before = await web3.eth.getBalance(B);
      const C_ETHBalance_Before = await web3.eth.getBalance(C);
      const D_ETHBalance_Before = await web3.eth.getBalance(D);

      // A, B, C, D provide to SP
      const A_GAS_Used = th.gasUsed(
        await stabilityPool.provideToSP(dec(100, 18), frontEnd_1, { from: A, gasPrice: GAS_PRICE })
      );
      const B_GAS_Used = th.gasUsed(
        await stabilityPool.provideToSP(dec(200, 18), ZERO_ADDRESS, { from: B, gasPrice: GAS_PRICE })
      );
      const C_GAS_Used = th.gasUsed(
        await stabilityPool.provideToSP(dec(300, 18), frontEnd_2, { from: C, gasPrice: GAS_PRICE })
      );
      const D_GAS_Used = th.gasUsed(
        await stabilityPool.provideToSP(dec(400, 18), ZERO_ADDRESS, { from: D, gasPrice: GAS_PRICE })
      );

      // ETH balances before minus gas used
      const A_expectedBalance = A_ETHBalance_Before - A_GAS_Used;
      const B_expectedBalance = B_ETHBalance_Before - B_GAS_Used;
      const C_expectedBalance = C_ETHBalance_Before - C_GAS_Used;
      const D_expectedBalance = D_ETHBalance_Before - D_GAS_Used;

      // Get  ETH balances after
      const A_ETHBalance_After = await web3.eth.getBalance(A);
      const B_ETHBalance_After = await web3.eth.getBalance(B);
      const C_ETHBalance_After = await web3.eth.getBalance(C);
      const D_ETHBalance_After = await web3.eth.getBalance(D);

      // Check ETH balances have not changed
      assert.equal(A_ETHBalance_After, A_expectedBalance);
      assert.equal(B_ETHBalance_After, B_expectedBalance);
      assert.equal(C_ETHBalance_After, C_expectedBalance);
      assert.equal(D_ETHBalance_After, D_expectedBalance);
    });

    it("provideToSP(): reverts when amount is zero", async () => {
      await openTrove({
        extraARTHAmount: toBN(dec(10000, 18)),
        ICR: toBN(dec(10, 18)),
        extraParams: { from: whale }
      });

      await openTrove({
        extraARTHAmount: toBN(dec(1000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: A }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(2000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: B }
      });

      // Whale transfers ARTH to C, D
      await arthToken.transfer(C, dec(100, 18), { from: whale });
      await arthToken.transfer(D, dec(100, 18), { from: whale });

      txPromise_A = stabilityPool.provideToSP(0, frontEnd_1, { from: A });
      txPromise_B = stabilityPool.provideToSP(0, ZERO_ADDRESS, { from: B });
      txPromise_C = stabilityPool.provideToSP(0, frontEnd_2, { from: C });
      txPromise_D = stabilityPool.provideToSP(0, ZERO_ADDRESS, { from: D });

      await th.assertRevert(txPromise_A, "StabilityPool: Amount must be non-zero");
      await th.assertRevert(txPromise_B, "StabilityPool: Amount must be non-zero");
      await th.assertRevert(txPromise_C, "StabilityPool: Amount must be non-zero");
      await th.assertRevert(txPromise_D, "StabilityPool: Amount must be non-zero");
    });

    it("provideToSP(): reverts if user is a registered front end", async () => {
      // C, D, E, F open troves
      await openTrove({
        extraARTHAmount: toBN(dec(30, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: C }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(30, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: D }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(30, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: E }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(30, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: F }
      });

      // C, E, F registers as front end
      await stabilityPool.registerFrontEnd(dec(1, 18), { from: C });
      await stabilityPool.registerFrontEnd(dec(1, 18), { from: E });
      await stabilityPool.registerFrontEnd(dec(1, 18), { from: F });

      const txPromise_C = stabilityPool.provideToSP(dec(10, 18), ZERO_ADDRESS, { from: C });
      const txPromise_E = stabilityPool.provideToSP(dec(10, 18), frontEnd_1, { from: E });
      const txPromise_F = stabilityPool.provideToSP(dec(10, 18), F, { from: F });
      await th.assertRevert(
        txPromise_C,
        "StabilityPool: must not already be a registered front end"
      );
      await th.assertRevert(
        txPromise_E,
        "StabilityPool: must not already be a registered front end"
      );
      await th.assertRevert(
        txPromise_F,
        "StabilityPool: must not already be a registered front end"
      );

      const txD = await stabilityPool.provideToSP(dec(10, 18), frontEnd_1, { from: D });
      assert.isTrue(txD.receipt.status);
    });

    it("provideToSP(): reverts if provided tag is not a registered front end", async () => {
      await openTrove({
        extraARTHAmount: toBN(dec(30, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: C }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(30, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: D }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(30, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: E }
      });

      const txPromise_C = stabilityPool.provideToSP(dec(10, 18), A, { from: C }); // passes another EOA
      const txPromise_D = stabilityPool.provideToSP(dec(10, 18), troveManager.address, { from: D });
      const txPromise_E = stabilityPool.provideToSP(dec(10, 18), stabilityPool.address, { from: E });
      const txPromise_F = stabilityPool.provideToSP(dec(10, 18), F, { from: F }); // passes itself

      await th.assertRevert(
        txPromise_C,
        "StabilityPool: Tag must be a registered front end, or the zero address"
      );
      await th.assertRevert(
        txPromise_D,
        "StabilityPool: Tag must be a registered front end, or the zero address"
      );
      await th.assertRevert(
        txPromise_E,
        "StabilityPool: Tag must be a registered front end, or the zero address"
      );
      await th.assertRevert(
        txPromise_F,
        "StabilityPool: Tag must be a registered front end, or the zero address"
      );
    });

    // --- withdrawFromSP ---

    it("withdrawFromSP(): reverts when user has no active deposit", async () => {
      await openTrove({
        extraARTHAmount: toBN(dec(100, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: alice }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(100, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: bob }
      });

      await stabilityPool.provideToSP(dec(100, 18), frontEnd_1, { from: alice });

      const alice_initialDeposit = (await stabilityPool.deposits(alice))[0].toString();
      const bob_initialDeposit = (await stabilityPool.deposits(bob))[0].toString();

      assert.equal(alice_initialDeposit, dec(100, 18));
      assert.equal(bob_initialDeposit, "0");

      const txAlice = await stabilityPool.withdrawFromSP(dec(100, 18), { from: alice });
      assert.isTrue(txAlice.receipt.status);

      try {
        const txBob = await stabilityPool.withdrawFromSP(dec(100, 18), { from: bob });
        assert.isFalse(txBob.receipt.status);
      } catch (err) {
        assert.include(err.message, "revert");
        // TODO: infamous issue #99
        //assert.include(err.message, "User must have a non-zero deposit")
      }
    });

    it("withdrawFromSP(): reverts when amount > 0 and system has an undercollateralized trove", async () => {
      await openTrove({
        extraARTHAmount: toBN(dec(100, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: alice }
      });

      await stabilityPool.provideToSP(dec(100, 18), frontEnd_1, { from: alice });

      const alice_initialDeposit = (await stabilityPool.deposits(alice))[0].toString();
      assert.equal(alice_initialDeposit, dec(100, 18));

      // defaulter opens trove
      await openTrove({ ICR: toBN(dec(2, 18)), extraParams: { from: defaulter_1 } });

      // ETH drops, defaulter is in liquidation range (but not liquidated yet)
      await priceFeed.setPrice(dec(100, 18));

      await th.assertRevert(stabilityPool.withdrawFromSP(dec(100, 18), { from: alice }));
    });

    it("withdrawFromSP(): partial retrieval - retrieves correct ARTH amount and the entire ETH Gain, and updates deposit", async () => {
      // --- SETUP ---
      // Whale deposits 185000 ARTH in StabilityPool
      await openTrove({
        extraARTHAmount: toBN(dec(1, 24)),
        ICR: toBN(dec(10, 18)),
        extraParams: { from: whale }
      });
      await stabilityPool.provideToSP(dec(185000, 18), frontEnd_1, { from: whale });

      // 2 Troves opened
      await openTrove({ ICR: toBN(dec(2, 18)), extraParams: { from: defaulter_1 } });
      await openTrove({ ICR: toBN(dec(2, 18)), extraParams: { from: defaulter_2 } });

      // --- TEST ---

      // Alice makes deposit #1: 15000 ARTH
      await openTrove({
        extraARTHAmount: toBN(dec(15000, 18)),
        ICR: toBN(dec(10, 18)),
        extraParams: { from: alice }
      });
      await stabilityPool.provideToSP(dec(15000, 18), frontEnd_1, { from: alice });

      // price drops: defaulters' Troves fall below MCR, alice and whale Trove remain active
      await priceFeed.setPrice(dec(105, 18));

      // 2 users with Trove with 170 ARTH drawn are closed
      const liquidationTX_1 = await troveManager.liquidate(defaulter_1, { from: owner }); // 170 ARTH closed
      const liquidationTX_2 = await troveManager.liquidate(defaulter_2, { from: owner }); // 170 ARTH closed

      const [liquidatedDebt_1] = await th.getEmittedLiquidationValues(liquidationTX_1);
      const [liquidatedDebt_2] = await th.getEmittedLiquidationValues(liquidationTX_2);

      // Alice ARTHLoss is ((15000/200000) * liquidatedDebt), for each liquidation
      const expectedARTHLoss_A = liquidatedDebt_1
        .mul(toBN(dec(15000, 18)))
        .div(toBN(dec(200000, 18)))
        .add(liquidatedDebt_2.mul(toBN(dec(15000, 18))).div(toBN(dec(200000, 18))));

      const expectedCompoundedARTHDeposit_A = toBN(dec(15000, 18)).sub(expectedARTHLoss_A);
      const compoundedARTHDeposit_A = await stabilityPool.getCompoundedARTHDeposit(alice);

      assert.isAtMost(
        th.getDifference(expectedCompoundedARTHDeposit_A, compoundedARTHDeposit_A),
        100000
      );

      // Alice retrieves part of her entitled ARTH: 9000 ARTH
      await stabilityPool.withdrawFromSP(dec(9000, 18), { from: alice });

      const expectedNewDeposit_A = compoundedARTHDeposit_A.sub(toBN(dec(9000, 18)));

      // check Alice's deposit has been updated to equal her compounded deposit minus her withdrawal */
      const newDeposit = (await stabilityPool.deposits(alice))[0].toString();
      assert.isAtMost(th.getDifference(newDeposit, expectedNewDeposit_A), 100000);

      // Expect Alice has withdrawn all ETH gain
      const alice_pendingETHGain = await stabilityPool.getDepositorETHGain(alice);
      assert.equal(alice_pendingETHGain, 0);
    });

    it("withdrawFromSP(): partial retrieval - leaves the correct amount of ARTH in the Stability Pool", async () => {
      // --- SETUP ---
      // Whale deposits 185000 ARTH in StabilityPool
      await openTrove({
        extraARTHAmount: toBN(dec(1, 24)),
        ICR: toBN(dec(10, 18)),
        extraParams: { from: whale }
      });
      await stabilityPool.provideToSP(dec(185000, 18), frontEnd_1, { from: whale });

      // 2 Troves opened
      await openTrove({ ICR: toBN(dec(2, 18)), extraParams: { from: defaulter_1 } });
      await openTrove({ ICR: toBN(dec(2, 18)), extraParams: { from: defaulter_2 } });
      // --- TEST ---

      // Alice makes deposit #1: 15000 ARTH
      await openTrove({
        extraARTHAmount: toBN(dec(15000, 18)),
        ICR: toBN(dec(10, 18)),
        extraParams: { from: alice }
      });
      await stabilityPool.provideToSP(dec(15000, 18), frontEnd_1, { from: alice });

      const SP_ARTH_Before = await stabilityPool.getTotalARTHDeposits();
      assert.equal(SP_ARTH_Before, dec(200000, 18));

      // price drops: defaulters' Troves fall below MCR, alice and whale Trove remain active
      await priceFeed.setPrice(dec(105, 18));

      // 2 users liquidated
      const liquidationTX_1 = await troveManager.liquidate(defaulter_1, { from: owner });
      const liquidationTX_2 = await troveManager.liquidate(defaulter_2, { from: owner });

      const [liquidatedDebt_1] = await th.getEmittedLiquidationValues(liquidationTX_1);
      const [liquidatedDebt_2] = await th.getEmittedLiquidationValues(liquidationTX_2);

      // Alice retrieves part of her entitled ARTH: 9000 ARTH
      await stabilityPool.withdrawFromSP(dec(9000, 18), { from: alice });

      /* Check SP has reduced from 2 liquidations and Alice's withdrawal
      Expect ARTH in SP = (200000 - liquidatedDebt_1 - liquidatedDebt_2 - 9000) */
      const expectedSPARTH = toBN(dec(200000, 18))
        .sub(toBN(liquidatedDebt_1))
        .sub(toBN(liquidatedDebt_2))
        .sub(toBN(dec(9000, 18)));

      const SP_ARTH_After = (await stabilityPool.getTotalARTHDeposits()).toString();

      th.assertIsApproximatelyEqual(SP_ARTH_After, expectedSPARTH);
    });

    it("withdrawFromSP(): full retrieval - leaves the correct amount of ARTH in the Stability Pool", async () => {
      // --- SETUP ---
      // Whale deposits 185000 ARTH in StabilityPool
      await openTrove({
        extraARTHAmount: toBN(dec(1000000, 18)),
        ICR: toBN(dec(10, 18)),
        extraParams: { from: whale }
      });
      await stabilityPool.provideToSP(dec(185000, 18), frontEnd_1, { from: whale });

      // 2 Troves opened
      await openTrove({ ICR: toBN(dec(2, 18)), extraParams: { from: defaulter_1 } });
      await openTrove({ ICR: toBN(dec(2, 18)), extraParams: { from: defaulter_2 } });

      // --- TEST ---

      // Alice makes deposit #1
      await openTrove({
        extraARTHAmount: toBN(dec(15000, 18)),
        ICR: toBN(dec(10, 18)),
        extraParams: { from: alice }
      });
      await stabilityPool.provideToSP(dec(15000, 18), frontEnd_1, { from: alice });

      const SP_ARTH_Before = await stabilityPool.getTotalARTHDeposits();
      assert.equal(SP_ARTH_Before, dec(200000, 18));

      // price drops: defaulters' Troves fall below MCR, alice and whale Trove remain active
      await priceFeed.setPrice(dec(105, 18));

      // 2 defaulters liquidated
      const liquidationTX_1 = await troveManager.liquidate(defaulter_1, { from: owner });
      const liquidationTX_2 = await troveManager.liquidate(defaulter_2, { from: owner });

      const [liquidatedDebt_1] = await th.getEmittedLiquidationValues(liquidationTX_1);
      const [liquidatedDebt_2] = await th.getEmittedLiquidationValues(liquidationTX_2);

      // Alice ARTHLoss is ((15000/200000) * liquidatedDebt), for each liquidation
      const expectedARTHLoss_A = liquidatedDebt_1
        .mul(toBN(dec(15000, 18)))
        .div(toBN(dec(200000, 18)))
        .add(liquidatedDebt_2.mul(toBN(dec(15000, 18))).div(toBN(dec(200000, 18))));

      const expectedCompoundedARTHDeposit_A = toBN(dec(15000, 18)).sub(expectedARTHLoss_A);
      const compoundedARTHDeposit_A = await stabilityPool.getCompoundedARTHDeposit(alice);

      assert.isAtMost(
        th.getDifference(expectedCompoundedARTHDeposit_A, compoundedARTHDeposit_A),
        100000
      );

      const ARTHinSPBefore = await stabilityPool.getTotalARTHDeposits();

      // Alice retrieves all of her entitled ARTH:
      await stabilityPool.withdrawFromSP(dec(15000, 18), { from: alice });

      const expectedARTHinSPAfter = ARTHinSPBefore.sub(compoundedARTHDeposit_A);

      const ARTHinSPAfter = await stabilityPool.getTotalARTHDeposits();
      assert.isAtMost(th.getDifference(expectedARTHinSPAfter, ARTHinSPAfter), 100000);
    });

    it("withdrawFromSP(): Subsequent deposit and withdrawal attempt from same account, with no intermediate liquidations, withdraws zero ETH", async () => {
      // --- SETUP ---
      // Whale deposits 1850 ARTH in StabilityPool
      await openTrove({
        extraARTHAmount: toBN(dec(1000000, 18)),
        ICR: toBN(dec(10, 18)),
        extraParams: { from: whale }
      });
      await stabilityPool.provideToSP(dec(18500, 18), frontEnd_1, { from: whale });

      // 2 defaulters open
      await openTrove({ ICR: toBN(dec(2, 18)), extraParams: { from: defaulter_1 } });
      await openTrove({ ICR: toBN(dec(2, 18)), extraParams: { from: defaulter_2 } });

      // --- TEST ---

      // Alice makes deposit #1: 15000 ARTH
      await openTrove({
        extraARTHAmount: toBN(dec(15000, 18)),
        ICR: toBN(dec(10, 18)),
        extraParams: { from: alice }
      });
      await stabilityPool.provideToSP(dec(15000, 18), frontEnd_1, { from: alice });

      // price drops: defaulters' Troves fall below MCR, alice and whale Trove remain active
      await priceFeed.setPrice(dec(105, 18));

      // defaulters liquidated
      await troveManager.liquidate(defaulter_1, { from: owner });
      await troveManager.liquidate(defaulter_2, { from: owner });

      // Alice retrieves all of her entitled ARTH:
      await stabilityPool.withdrawFromSP(dec(15000, 18), { from: alice });
      assert.equal(await stabilityPool.getDepositorETHGain(alice), 0);

      // Alice makes second deposit
      await stabilityPool.provideToSP(dec(10000, 18), frontEnd_1, { from: alice });
      assert.equal(await stabilityPool.getDepositorETHGain(alice), 0);

      const ETHinSP_Before = (await stabilityPool.getETH()).toString();

      // Alice attempts second withdrawal
      await stabilityPool.withdrawFromSP(dec(10000, 18), { from: alice });
      assert.equal(await stabilityPool.getDepositorETHGain(alice), 0);

      // Check ETH in pool does not change
      const ETHinSP_1 = (await stabilityPool.getETH()).toString();
      assert.equal(ETHinSP_Before, ETHinSP_1);

      // Third deposit
      await stabilityPool.provideToSP(dec(10000, 18), frontEnd_1, { from: alice });
      assert.equal(await stabilityPool.getDepositorETHGain(alice), 0);

      // Alice attempts third withdrawal (this time, frm SP to Trove)
      const txPromise_A = stabilityPool.withdrawETHGainToTrove(alice, alice, { from: alice });
      await th.assertRevert(txPromise_A);
    });

    it("withdrawFromSP(): it correctly updates the user's ARTH and ETH snapshots of entitled reward per unit staked", async () => {
      // --- SETUP ---
      // Whale deposits 185000 ARTH in StabilityPool
      await openTrove({
        extraARTHAmount: toBN(dec(1000000, 18)),
        ICR: toBN(dec(10, 18)),
        extraParams: { from: whale }
      });
      await stabilityPool.provideToSP(dec(185000, 18), frontEnd_1, { from: whale });

      // 2 defaulters open
      await openTrove({ ICR: toBN(dec(2, 18)), extraParams: { from: defaulter_1 } });
      await openTrove({ ICR: toBN(dec(2, 18)), extraParams: { from: defaulter_2 } });

      // --- TEST ---

      // Alice makes deposit #1: 15000 ARTH
      await openTrove({
        extraARTHAmount: toBN(dec(15000, 18)),
        ICR: toBN(dec(10, 18)),
        extraParams: { from: alice }
      });
      await stabilityPool.provideToSP(dec(15000, 18), frontEnd_1, { from: alice });

      // check 'Before' snapshots
      const alice_snapshot_Before = await stabilityPool.depositSnapshots(alice);
      const alice_snapshot_S_Before = alice_snapshot_Before[0].toString();
      const alice_snapshot_P_Before = alice_snapshot_Before[1].toString();
      assert.equal(alice_snapshot_S_Before, 0);
      assert.equal(alice_snapshot_P_Before, "1000000000000000000");

      // price drops: defaulters' Troves fall below MCR, alice and whale Trove remain active
      await priceFeed.setPrice(dec(105, 18));

      // 2 defaulters liquidated
      await troveManager.liquidate(defaulter_1, { from: owner });
      await troveManager.liquidate(defaulter_2, { from: owner });

      // Alice retrieves part of her entitled ARTH: 9000 ARTH
      await stabilityPool.withdrawFromSP(dec(9000, 18), { from: alice });

      const P = (await stabilityPool.P()).toString();
      const S = (await stabilityPool.epochToScaleToSum(0, 0)).toString();
      // check 'After' snapshots
      const alice_snapshot_After = await stabilityPool.depositSnapshots(alice);
      const alice_snapshot_S_After = alice_snapshot_After[0].toString();
      const alice_snapshot_P_After = alice_snapshot_After[1].toString();
      assert.equal(alice_snapshot_S_After, S);
      assert.equal(alice_snapshot_P_After, P);
    });

    it("withdrawFromSP(): decreases StabilityPool ETH", async () => {
      // --- SETUP ---
      // Whale deposits 185000 ARTH in StabilityPool
      await openTrove({
        extraARTHAmount: toBN(dec(1000000, 18)),
        ICR: toBN(dec(10, 18)),
        extraParams: { from: whale }
      });
      await stabilityPool.provideToSP(dec(185000, 18), frontEnd_1, { from: whale });

      // 1 defaulter opens
      await openTrove({ ICR: toBN(dec(2, 18)), extraParams: { from: defaulter_1 } });

      // --- TEST ---

      // Alice makes deposit #1: 15000 ARTH
      await openTrove({
        extraARTHAmount: toBN(dec(15000, 18)),
        ICR: toBN(dec(10, 18)),
        extraParams: { from: alice }
      });
      await stabilityPool.provideToSP(dec(15000, 18), frontEnd_1, { from: alice });

      // price drops: defaulter's Trove falls below MCR, alice and whale Trove remain active
      await priceFeed.setPrice("100000000000000000000");

      // defaulter's Trove is closed.
      const liquidationTx_1 = await troveManager.liquidate(defaulter_1, { from: owner }); // 180 ARTH closed
      const [, liquidatedColl] = th.getEmittedLiquidationValues(liquidationTx_1);

      //Get ActivePool and StabilityPool Ether before retrieval:
      const active_ETH_Before = await activePool.getETH();
      const stability_ETH_Before = await stabilityPool.getETH();

      // Expect alice to be entitled to 15000/200000 of the liquidated coll
      const aliceExpectedETHGain = liquidatedColl
        .mul(toBN(dec(15000, 18)))
        .div(toBN(dec(200000, 18)));
      const aliceETHGain = await stabilityPool.getDepositorETHGain(alice);
      assert.isTrue(aliceExpectedETHGain.eq(aliceETHGain));

      // Alice retrieves all of her deposit
      await stabilityPool.withdrawFromSP(dec(15000, 18), { from: alice });

      const active_ETH_After = await activePool.getETH();
      const stability_ETH_After = await stabilityPool.getETH();

      const active_ETH_Difference = active_ETH_Before.sub(active_ETH_After);
      const stability_ETH_Difference = stability_ETH_Before.sub(stability_ETH_After);

      assert.equal(active_ETH_Difference, "0");

      // Expect StabilityPool to have decreased by Alice's ETHGain
      assert.isAtMost(th.getDifference(stability_ETH_Difference, aliceETHGain), 10000);
    });

    it("withdrawFromSP(): All depositors are able to withdraw from the SP to their account", async () => {
      // Whale opens trove
      await openTrove({ ICR: toBN(dec(10, 18)), extraParams: { from: whale } });

      // 1 defaulter open
      await openTrove({ ICR: toBN(dec(2, 18)), extraParams: { from: defaulter_1 } });

      // 6 Accounts open troves and provide to SP
      const depositors = [alice, bob, carol, dennis, erin, flyn];
      for (account of depositors) {
        await openTrove({
          extraARTHAmount: toBN(dec(10000, 18)),
          ICR: toBN(dec(2, 18)),
          extraParams: { from: account }
        });
        await stabilityPool.provideToSP(dec(10000, 18), frontEnd_1, { from: account });
      }

      await priceFeed.setPrice(dec(105, 18));
      await troveManager.liquidate(defaulter_1);

      await priceFeed.setPrice(dec(200, 18));

      // All depositors attempt to withdraw
      await stabilityPool.withdrawFromSP(dec(10000, 18), { from: alice });
      assert.equal((await stabilityPool.deposits(alice))[0].toString(), "0");
      await stabilityPool.withdrawFromSP(dec(10000, 18), { from: bob });
      assert.equal((await stabilityPool.deposits(alice))[0].toString(), "0");
      await stabilityPool.withdrawFromSP(dec(10000, 18), { from: carol });
      assert.equal((await stabilityPool.deposits(alice))[0].toString(), "0");
      await stabilityPool.withdrawFromSP(dec(10000, 18), { from: dennis });
      assert.equal((await stabilityPool.deposits(alice))[0].toString(), "0");
      await stabilityPool.withdrawFromSP(dec(10000, 18), { from: erin });
      assert.equal((await stabilityPool.deposits(alice))[0].toString(), "0");
      await stabilityPool.withdrawFromSP(dec(10000, 18), { from: flyn });
      assert.equal((await stabilityPool.deposits(alice))[0].toString(), "0");

      const totalDeposits = (await stabilityPool.getTotalARTHDeposits()).toString();

      assert.isAtMost(th.getDifference(totalDeposits, "0"), 100000);
    });

    it("withdrawFromSP(): increases depositor's ARTH token balance by the expected amount", async () => {
      // Whale opens trove
      await openTrove({
        extraARTHAmount: toBN(dec(100000, 18)),
        ICR: toBN(dec(10, 18)),
        extraParams: { from: whale }
      });

      // 1 defaulter opens trove
      await borrowerOperations.openTrove(
        th._100pct,
        await getOpenTroveARTHAmount(dec(10000, 18)),
        defaulter_1,
        defaulter_1,
        ZERO_ADDRESS, { from: defaulter_1, value: dec(100, 'ether') }
      );

      const defaulterDebt = (await troveManager.getEntireDebtAndColl(defaulter_1))[0];

      // 6 Accounts open troves and provide to SP
      const depositors = [alice, bob, carol, dennis, erin, flyn];
      for (account of depositors) {
        await openTrove({
          extraARTHAmount: toBN(dec(10000, 18)),
          ICR: toBN(dec(2, 18)),
          extraParams: { from: account }
        });
        await stabilityPool.provideToSP(dec(10000, 18), frontEnd_1, { from: account });
      }

      await priceFeed.setPrice(dec(105, 18));
      await troveManager.liquidate(defaulter_1);

      const aliceBalBefore = await arthToken.balanceOf(alice);
      const bobBalBefore = await arthToken.balanceOf(bob);

      /* From an offset of 10000 ARTH, each depositor receives
      ARTHLoss = 1666.6666666666666666 ARTH

      and thus with a deposit of 10000 ARTH, each should withdraw 8333.3333333333333333 ARTH (in practice, slightly less due to rounding error)
      */

      // Price bounces back to $200 per ETH
      await priceFeed.setPrice(dec(200, 18));

      // Bob issues a further 5000 ARTH from his trove
      await borrowerOperations.withdrawARTH(th._100pct, dec(5000, 18), bob, bob, { from: bob });

      // Expect Alice's ARTH balance increase be very close to 8333.3333333333333333 ARTH
      await stabilityPool.withdrawFromSP(dec(10000, 18), { from: alice });
      const aliceBalance = await arthToken.balanceOf(alice);

      assert.isAtMost(
        th.getDifference(aliceBalance.sub(aliceBalBefore), "8333333333333333333333"),
        100000
      );

      // expect Bob's ARTH balance increase to be very close to  13333.33333333333333333 ARTH
      await stabilityPool.withdrawFromSP(dec(10000, 18), { from: bob });
      const bobBalance = await arthToken.balanceOf(bob);
      assert.isAtMost(
        th.getDifference(bobBalance.sub(bobBalBefore), "13333333333333333333333"),
        100000
      );
    });

    it("withdrawFromSP(): doesn't impact other users Stability deposits or ETH gains", async () => {
      await openTrove({
        extraARTHAmount: toBN(dec(100000, 18)),
        ICR: toBN(dec(10, 18)),
        extraParams: { from: whale }
      });

      // A, B, C open troves and make Stability Pool deposits
      await openTrove({
        extraARTHAmount: toBN(dec(10000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: alice }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(20000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: bob }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(30000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: carol }
      });

      await stabilityPool.provideToSP(dec(10000, 18), frontEnd_1, { from: alice });
      await stabilityPool.provideToSP(dec(20000, 18), frontEnd_1, { from: bob });
      await stabilityPool.provideToSP(dec(30000, 18), frontEnd_1, { from: carol });

      // Would-be defaulters open troves
      await openTrove({ ICR: toBN(dec(2, 18)), extraParams: { from: defaulter_1 } });
      await openTrove({ ICR: toBN(dec(2, 18)), extraParams: { from: defaulter_2 } });

      // Price drops
      await priceFeed.setPrice(dec(105, 18));

      // Defaulters are liquidated
      await troveManager.liquidate(defaulter_1);
      await troveManager.liquidate(defaulter_2);
      assert.isFalse(await sortedTroves.contains(defaulter_1));
      assert.isFalse(await sortedTroves.contains(defaulter_2));

      const alice_ARTHDeposit_Before = (
        await stabilityPool.getCompoundedARTHDeposit(alice)
      ).toString();
      const bob_ARTHDeposit_Before = (await stabilityPool.getCompoundedARTHDeposit(bob)).toString();

      const alice_ETHGain_Before = (await stabilityPool.getDepositorETHGain(alice)).toString();
      const bob_ETHGain_Before = (await stabilityPool.getDepositorETHGain(bob)).toString();

      //check non-zero ARTH and ETHGain in the Stability Pool
      const ARTHinSP = await stabilityPool.getTotalARTHDeposits();
      const ETHinSP = await stabilityPool.getETH();
      assert.isTrue(ARTHinSP.gt(mv._zeroBN));
      assert.isTrue(ETHinSP.gt(mv._zeroBN));

      // Price rises
      await priceFeed.setPrice(dec(200, 18));

      // Carol withdraws her Stability deposit
      assert.equal((await stabilityPool.deposits(carol))[0].toString(), dec(30000, 18));
      await stabilityPool.withdrawFromSP(dec(30000, 18), { from: carol });
      assert.equal((await stabilityPool.deposits(carol))[0].toString(), "0");

      const alice_ARTHDeposit_After = (
        await stabilityPool.getCompoundedARTHDeposit(alice)
      ).toString();
      const bob_ARTHDeposit_After = (await stabilityPool.getCompoundedARTHDeposit(bob)).toString();

      const alice_ETHGain_After = (await stabilityPool.getDepositorETHGain(alice)).toString();
      const bob_ETHGain_After = (await stabilityPool.getDepositorETHGain(bob)).toString();

      // Check compounded deposits and ETH gains for A and B have not changed
      assert.equal(alice_ARTHDeposit_Before, alice_ARTHDeposit_After);
      assert.equal(bob_ARTHDeposit_Before, bob_ARTHDeposit_After);

      assert.equal(alice_ETHGain_Before, alice_ETHGain_After);
      assert.equal(bob_ETHGain_Before, bob_ETHGain_After);
    });

    it("withdrawFromSP(): doesn't impact system debt, collateral or TCR ", async () => {
      await openTrove({
        extraARTHAmount: toBN(dec(100000, 18)),
        ICR: toBN(dec(10, 18)),
        extraParams: { from: whale }
      });

      // A, B, C open troves and make Stability Pool deposits
      await openTrove({
        extraARTHAmount: toBN(dec(10000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: alice }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(20000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: bob }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(30000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: carol }
      });

      await stabilityPool.provideToSP(dec(10000, 18), frontEnd_1, { from: alice });
      await stabilityPool.provideToSP(dec(20000, 18), frontEnd_1, { from: bob });
      await stabilityPool.provideToSP(dec(30000, 18), frontEnd_1, { from: carol });

      // Would-be defaulters open troves
      await openTrove({ ICR: toBN(dec(2, 18)), extraParams: { from: defaulter_1 } });
      await openTrove({ ICR: toBN(dec(2, 18)), extraParams: { from: defaulter_2 } });

      // Price drops
      await priceFeed.setPrice(dec(105, 18));

      // Defaulters are liquidated
      await troveManager.liquidate(defaulter_1);
      await troveManager.liquidate(defaulter_2);
      assert.isFalse(await sortedTroves.contains(defaulter_1));
      assert.isFalse(await sortedTroves.contains(defaulter_2));

      // Price rises
      await priceFeed.setPrice(dec(200, 18));

      const activeDebt_Before = (await activePool.getARTHDebt()).toString();
      const defaultedDebt_Before = (await defaultPool.getARTHDebt()).toString();
      const activeColl_Before = (await activePool.getETH()).toString();
      const defaultedColl_Before = (await defaultPool.getETH()).toString();
      const TCR_Before = (await th.getTCR(contracts)).toString();

      // Carol withdraws her Stability deposit
      assert.equal((await stabilityPool.deposits(carol))[0].toString(), dec(30000, 18));
      await stabilityPool.withdrawFromSP(dec(30000, 18), { from: carol });
      assert.equal((await stabilityPool.deposits(carol))[0].toString(), "0");

      const activeDebt_After = (await activePool.getARTHDebt()).toString();
      const defaultedDebt_After = (await defaultPool.getARTHDebt()).toString();
      const activeColl_After = (await activePool.getETH()).toString();
      const defaultedColl_After = (await defaultPool.getETH()).toString();
      const TCR_After = (await th.getTCR(contracts)).toString();

      // Check total system debt, collateral and TCR have not changed after a Stability deposit is made
      assert.equal(activeDebt_Before, activeDebt_After);
      assert.equal(defaultedDebt_Before, defaultedDebt_After);
      assert.equal(activeColl_Before, activeColl_After);
      assert.equal(defaultedColl_Before, defaultedColl_After);
      assert.equal(TCR_Before, TCR_After);
    });

    it("withdrawFromSP(): doesn't impact any troves, including the caller's trove", async () => {
      await openTrove({
        extraARTHAmount: toBN(dec(100000, 18)),
        ICR: toBN(dec(10, 18)),
        extraParams: { from: whale }
      });

      // A, B, C open troves and make Stability Pool deposits
      await openTrove({
        extraARTHAmount: toBN(dec(10000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: alice }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(20000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: bob }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(30000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: carol }
      });

      // A, B and C provide to SP
      await stabilityPool.provideToSP(dec(10000, 18), frontEnd_1, { from: alice });
      await stabilityPool.provideToSP(dec(20000, 18), frontEnd_1, { from: bob });
      await stabilityPool.provideToSP(dec(30000, 18), frontEnd_1, { from: carol });

      // Price drops
      await priceFeed.setPrice(dec(105, 18));
      const price = await priceFeed.getPrice();

      // Get debt, collateral and ICR of all existing troves
      const whale_Debt_Before = (await troveManager.Troves(whale))[0].toString();
      const alice_Debt_Before = (await troveManager.Troves(alice))[0].toString();
      const bob_Debt_Before = (await troveManager.Troves(bob))[0].toString();
      const carol_Debt_Before = (await troveManager.Troves(carol))[0].toString();

      const whale_Coll_Before = (await troveManager.Troves(whale))[1].toString();
      const alice_Coll_Before = (await troveManager.Troves(alice))[1].toString();
      const bob_Coll_Before = (await troveManager.Troves(bob))[1].toString();
      const carol_Coll_Before = (await troveManager.Troves(carol))[1].toString();

      const whale_ICR_Before = (await troveManager.getCurrentICR(whale, price)).toString();
      const alice_ICR_Before = (await troveManager.getCurrentICR(alice, price)).toString();
      const bob_ICR_Before = (await troveManager.getCurrentICR(bob, price)).toString();
      const carol_ICR_Before = (await troveManager.getCurrentICR(carol, price)).toString();

      // price rises
      await priceFeed.setPrice(dec(200, 18));

      // Carol withdraws her Stability deposit
      assert.equal((await stabilityPool.deposits(carol))[0].toString(), dec(30000, 18));
      await stabilityPool.withdrawFromSP(dec(30000, 18), { from: carol });
      assert.equal((await stabilityPool.deposits(carol))[0].toString(), "0");

      const whale_Debt_After = (await troveManager.Troves(whale))[0].toString();
      const alice_Debt_After = (await troveManager.Troves(alice))[0].toString();
      const bob_Debt_After = (await troveManager.Troves(bob))[0].toString();
      const carol_Debt_After = (await troveManager.Troves(carol))[0].toString();

      const whale_Coll_After = (await troveManager.Troves(whale))[1].toString();
      const alice_Coll_After = (await troveManager.Troves(alice))[1].toString();
      const bob_Coll_After = (await troveManager.Troves(bob))[1].toString();
      const carol_Coll_After = (await troveManager.Troves(carol))[1].toString();

      const whale_ICR_After = (await troveManager.getCurrentICR(whale, price)).toString();
      const alice_ICR_After = (await troveManager.getCurrentICR(alice, price)).toString();
      const bob_ICR_After = (await troveManager.getCurrentICR(bob, price)).toString();
      const carol_ICR_After = (await troveManager.getCurrentICR(carol, price)).toString();

      // Check all troves are unaffected by Carol's Stability deposit withdrawal
      assert.equal(whale_Debt_Before, whale_Debt_After);
      assert.equal(alice_Debt_Before, alice_Debt_After);
      assert.equal(bob_Debt_Before, bob_Debt_After);
      assert.equal(carol_Debt_Before, carol_Debt_After);

      assert.equal(whale_Coll_Before, whale_Coll_After);
      assert.equal(alice_Coll_Before, alice_Coll_After);
      assert.equal(bob_Coll_Before, bob_Coll_After);
      assert.equal(carol_Coll_Before, carol_Coll_After);

      assert.equal(whale_ICR_Before, whale_ICR_After);
      assert.equal(alice_ICR_Before, alice_ICR_After);
      assert.equal(bob_ICR_Before, bob_ICR_After);
      assert.equal(carol_ICR_Before, carol_ICR_After);
    });

    it("withdrawFromSP(): withdrawing 0 ARTH doesn't alter the caller's deposit or the total ARTH in the Stability Pool", async () => {
      // --- SETUP ---
      await openTrove({
        extraARTHAmount: toBN(dec(10000, 18)),
        ICR: toBN(dec(10, 18)),
        extraParams: { from: whale }
      });

      // A, B, C open troves and make Stability Pool deposits
      await openTrove({
        extraARTHAmount: toBN(dec(10000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: alice }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(20000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: bob }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(30000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: carol }
      });

      // A, B, C provides 100, 50, 30 ARTH to SP
      await stabilityPool.provideToSP(dec(100, 18), frontEnd_1, { from: alice });
      await stabilityPool.provideToSP(dec(50, 18), frontEnd_1, { from: bob });
      await stabilityPool.provideToSP(dec(30, 18), frontEnd_1, { from: carol });

      const bob_Deposit_Before = (await stabilityPool.getCompoundedARTHDeposit(bob)).toString();
      const ARTHinSP_Before = (await stabilityPool.getTotalARTHDeposits()).toString();

      assert.equal(ARTHinSP_Before, dec(180, 18));

      // Bob withdraws 0 ARTH from the Stability Pool
      await stabilityPool.withdrawFromSP(0, { from: bob });

      // check Bob's deposit and total ARTH in Stability Pool has not changed
      const bob_Deposit_After = (await stabilityPool.getCompoundedARTHDeposit(bob)).toString();
      const ARTHinSP_After = (await stabilityPool.getTotalARTHDeposits()).toString();

      assert.equal(bob_Deposit_Before, bob_Deposit_After);
      assert.equal(ARTHinSP_Before, ARTHinSP_After);
    });

    it("withdrawFromSP(): withdrawing 0 ETH Gain does not alter the caller's ETH balance, their trove collateral, or the ETH  in the Stability Pool", async () => {
      await openTrove({
        extraARTHAmount: toBN(dec(10000, 18)),
        ICR: toBN(dec(10, 18)),
        extraParams: { from: whale }
      });

      // A, B, C open troves and make Stability Pool deposits
      await openTrove({
        extraARTHAmount: toBN(dec(10000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: alice }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(20000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: bob }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(30000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: carol }
      });

      // Would-be defaulter open trove
      await openTrove({
        extraARTHAmount: toBN(dec(10000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: defaulter_1 }
      });

      // Price drops
      await priceFeed.setPrice(dec(105, 18));

      assert.isFalse(await th.checkRecoveryMode(contracts));

      // Defaulter 1 liquidated, full offset
      await troveManager.liquidate(defaulter_1);

      // Dennis opens trove and deposits to Stability Pool
      await openTrove({
        extraARTHAmount: toBN(dec(10000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: dennis }
      });
      await stabilityPool.provideToSP(dec(100, 18), frontEnd_1, { from: dennis });

      // Check Dennis has 0 ETHGain
      const dennis_ETHGain = (await stabilityPool.getDepositorETHGain(dennis)).toString();
      assert.equal(dennis_ETHGain, "0");

      const dennis_ETHBalance_Before = web3.eth.getBalance(dennis).toString();
      const dennis_Collateral_Before = (await troveManager.Troves(dennis))[1].toString();
      const ETHinSP_Before = (await stabilityPool.getETH()).toString();

      await priceFeed.setPrice(dec(200, 18));

      // Dennis withdraws his full deposit and ETHGain to his account
      await stabilityPool.withdrawFromSP(dec(100, 18), { from: dennis, gasPrice: GAS_PRICE });

      // Check withdrawal does not alter Dennis' ETH balance or his trove's collateral
      const dennis_ETHBalance_After = web3.eth.getBalance(dennis).toString();
      const dennis_Collateral_After = (await troveManager.Troves(dennis))[1].toString();
      const ETHinSP_After = (await stabilityPool.getETH()).toString();

      assert.equal(dennis_ETHBalance_Before, dennis_ETHBalance_After);
      assert.equal(dennis_Collateral_Before, dennis_Collateral_After);

      // Check withdrawal has not altered the ETH in the Stability Pool
      assert.equal(ETHinSP_Before, ETHinSP_After);
    });

    it("withdrawFromSP(): Request to withdraw > caller's deposit only withdraws the caller's compounded deposit", async () => {
      // --- SETUP ---
      await openTrove({
        extraARTHAmount: toBN(dec(10000, 18)),
        ICR: toBN(dec(10, 18)),
        extraParams: { from: whale }
      });

      // A, B, C open troves and make Stability Pool deposits
      await openTrove({
        extraARTHAmount: toBN(dec(10000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: alice }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(20000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: bob }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(30000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: carol }
      });

      await openTrove({
        extraARTHAmount: toBN(dec(10000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: defaulter_1 }
      });

      // A, B, C provide ARTH to SP
      await stabilityPool.provideToSP(dec(10000, 18), frontEnd_1, { from: alice });
      await stabilityPool.provideToSP(dec(20000, 18), frontEnd_1, { from: bob });
      await stabilityPool.provideToSP(dec(30000, 18), frontEnd_1, { from: carol });

      // Price drops
      await priceFeed.setPrice(dec(105, 18));

      // Liquidate defaulter 1
      await troveManager.liquidate(defaulter_1);

      const alice_ARTH_Balance_Before = await arthToken.balanceOf(alice);
      const bob_ARTH_Balance_Before = await arthToken.balanceOf(bob);

      const alice_Deposit_Before = await stabilityPool.getCompoundedARTHDeposit(alice);
      const bob_Deposit_Before = await stabilityPool.getCompoundedARTHDeposit(bob);

      const ARTHinSP_Before = await stabilityPool.getTotalARTHDeposits();

      await priceFeed.setPrice(dec(200, 18));

      // Bob attempts to withdraws 1 wei more than his compounded deposit from the Stability Pool
      await stabilityPool.withdrawFromSP(bob_Deposit_Before.add(toBN(1)), { from: bob });

      // Check Bob's ARTH balance has risen by only the value of his compounded deposit
      const bob_expectedARTHBalance = bob_ARTH_Balance_Before.add(bob_Deposit_Before).toString();
      const bob_ARTH_Balance_After = (await arthToken.balanceOf(bob)).toString();
      assert.equal(bob_ARTH_Balance_After, bob_expectedARTHBalance);

      // Alice attempts to withdraws 2309842309.000000000000000000 ARTH from the Stability Pool
      await stabilityPool.withdrawFromSP("2309842309000000000000000000", { from: alice });

      // Check Alice's ARTH balance has risen by only the value of her compounded deposit
      const alice_expectedARTHBalance = alice_ARTH_Balance_Before
        .add(alice_Deposit_Before)
        .toString();
      const alice_ARTH_Balance_After = (await arthToken.balanceOf(alice)).toString();
      assert.equal(alice_ARTH_Balance_After, alice_expectedARTHBalance);

      // Check ARTH in Stability Pool has been reduced by only Alice's compounded deposit and Bob's compounded deposit
      const expectedARTHinSP = ARTHinSP_Before.sub(alice_Deposit_Before)
        .sub(bob_Deposit_Before)
        .toString();
      const ARTHinSP_After = (await stabilityPool.getTotalARTHDeposits()).toString();
      assert.equal(ARTHinSP_After, expectedARTHinSP);
    });

    it("withdrawFromSP(): Request to withdraw 2^256-1 ARTH only withdraws the caller's compounded deposit", async () => {
      // --- SETUP ---
      await openTrove({
        extraARTHAmount: toBN(dec(10000, 18)),
        ICR: toBN(dec(10, 18)),
        extraParams: { from: whale }
      });

      // A, B, C open troves
      // A, B, C open troves
      // A, B, C open troves
      // A, B, C open troves
      // A, B, C open troves
      // A, B, C open troves
      // A, B, C open troves
      await openTrove({
        extraARTHAmount: toBN(dec(10000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: alice }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(20000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: bob }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(30000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: carol }
      });

      await openTrove({ ICR: toBN(dec(2, 18)), extraParams: { from: defaulter_1 } });

      // A, B, C provides 100, 50, 30 ARTH to SP
      await stabilityPool.provideToSP(dec(100, 18), frontEnd_1, { from: alice });
      await stabilityPool.provideToSP(dec(50, 18), frontEnd_1, { from: bob });
      await stabilityPool.provideToSP(dec(30, 18), frontEnd_1, { from: carol });

      // Price drops
      await priceFeed.setPrice(dec(100, 18));

      // Liquidate defaulter 1
      await troveManager.liquidate(defaulter_1);

      const bob_ARTH_Balance_Before = await arthToken.balanceOf(bob);

      const bob_Deposit_Before = await stabilityPool.getCompoundedARTHDeposit(bob);

      const ARTHinSP_Before = await stabilityPool.getTotalARTHDeposits();

      const maxBytes32 = web3.utils.toBN(
        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
      );

      // Price drops
      await priceFeed.setPrice(dec(200, 18));

      // Bob attempts to withdraws maxBytes32 ARTH from the Stability Pool
      await stabilityPool.withdrawFromSP(maxBytes32, { from: bob });

      // Check Bob's ARTH balance has risen by only the value of his compounded deposit
      const bob_expectedARTHBalance = bob_ARTH_Balance_Before.add(bob_Deposit_Before).toString();
      const bob_ARTH_Balance_After = (await arthToken.balanceOf(bob)).toString();
      assert.equal(bob_ARTH_Balance_After, bob_expectedARTHBalance);

      // Check ARTH in Stability Pool has been reduced by only  Bob's compounded deposit
      const expectedARTHinSP = ARTHinSP_Before.sub(bob_Deposit_Before).toString();
      const ARTHinSP_After = (await stabilityPool.getTotalARTHDeposits()).toString();
      assert.equal(ARTHinSP_After, expectedARTHinSP);
    });

    it("withdrawFromSP(): caller can withdraw full deposit and ETH gain during Recovery Mode", async () => {
      // --- SETUP ---

      // Price doubles
      await priceFeed.setPrice(dec(400, 18));
      await openTrove({
        extraARTHAmount: toBN(dec(1000000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: whale }
      });
      // Price halves
      await priceFeed.setPrice(dec(200, 18));

      // A, B, C open troves and make Stability Pool deposits
      await openTrove({
        extraARTHAmount: toBN(dec(10000, 18)),
        ICR: toBN(dec(4, 18)),
        extraParams: { from: alice }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(20000, 18)),
        ICR: toBN(dec(4, 18)),
        extraParams: { from: bob }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(30000, 18)),
        ICR: toBN(dec(4, 18)),
        extraParams: { from: carol }
      });

      await borrowerOperations.openTrove(
        th._100pct,
        await getOpenTroveARTHAmount(dec(10000, 18)),
        defaulter_1,
        defaulter_1,
        ZERO_ADDRESS, { from: defaulter_1, value: dec(100, 'ether') }
      );

      // A, B, C provides 10000, 5000, 3000 ARTH to SP
      const A_GAS_Used = th.gasUsed(
        await stabilityPool.provideToSP(dec(10000, 18), frontEnd_1, {
          from: alice,
          gasPrice: GAS_PRICE
        })
      );
      const B_GAS_Used = th.gasUsed(
        await stabilityPool.provideToSP(dec(5000, 18), frontEnd_1, {
          from: bob,
          gasPrice: GAS_PRICE
        })
      );
      const C_GAS_Used = th.gasUsed(
        await stabilityPool.provideToSP(dec(3000, 18), frontEnd_1, {
          from: carol,
          gasPrice: GAS_PRICE
        })
      );

      // Price drops
      await priceFeed.setPrice(dec(105, 18));
      const price = await priceFeed.getPrice();

      assert.isTrue(await th.checkRecoveryMode(contracts));

      // Liquidate defaulter 1
      await troveManager.liquidate(defaulter_1);
      assert.isFalse(await sortedTroves.contains(defaulter_1));

      const alice_ARTH_Balance_Before = await arthToken.balanceOf(alice);
      const bob_ARTH_Balance_Before = await arthToken.balanceOf(bob);
      const carol_ARTH_Balance_Before = await arthToken.balanceOf(carol);

      const alice_ETH_Balance_Before = web3.utils.toBN(await web3.eth.getBalance(alice));
      const bob_ETH_Balance_Before = web3.utils.toBN(await web3.eth.getBalance(bob));
      const carol_ETH_Balance_Before = web3.utils.toBN(await web3.eth.getBalance(carol));

      const alice_Deposit_Before = await stabilityPool.getCompoundedARTHDeposit(alice);
      const bob_Deposit_Before = await stabilityPool.getCompoundedARTHDeposit(bob);
      const carol_Deposit_Before = await stabilityPool.getCompoundedARTHDeposit(carol);

      const alice_ETHGain_Before = await stabilityPool.getDepositorETHGain(alice);
      const bob_ETHGain_Before = await stabilityPool.getDepositorETHGain(bob);
      const carol_ETHGain_Before = await stabilityPool.getDepositorETHGain(carol);

      const ARTHinSP_Before = await stabilityPool.getTotalARTHDeposits();

      // Price rises
      await priceFeed.setPrice(dec(220, 18));

      assert.isTrue(await th.checkRecoveryMode(contracts));

      // A, B, C withdraw their full deposits from the Stability Pool
      const A_GAS_Deposit = th.gasUsed(
        await stabilityPool.withdrawFromSP(dec(10000, 18), { from: alice, gasPrice: GAS_PRICE })
      );
      const B_GAS_Deposit = th.gasUsed(
        await stabilityPool.withdrawFromSP(dec(5000, 18), { from: bob, gasPrice: GAS_PRICE })
      );
      const C_GAS_Deposit = th.gasUsed(
        await stabilityPool.withdrawFromSP(dec(3000, 18), { from: carol, gasPrice: GAS_PRICE })
      );

      // Check ARTH balances of A, B, C have risen by the value of their compounded deposits, respectively
      const alice_expectedARTHBalance = alice_ARTH_Balance_Before
        .add(alice_Deposit_Before)
        .toString();

      const bob_expectedARTHBalance = bob_ARTH_Balance_Before.add(bob_Deposit_Before).toString();
      const carol_expectedARTHBalance = carol_ARTH_Balance_Before
        .add(carol_Deposit_Before)
        .toString();

      const alice_ARTH_Balance_After = (await arthToken.balanceOf(alice)).toString();

      const bob_ARTH_Balance_After = (await arthToken.balanceOf(bob)).toString();
      const carol_ARTH_Balance_After = (await arthToken.balanceOf(carol)).toString();

      assert.equal(alice_ARTH_Balance_After, alice_expectedARTHBalance);
      assert.equal(bob_ARTH_Balance_After, bob_expectedARTHBalance);
      assert.equal(carol_ARTH_Balance_After, carol_expectedARTHBalance);

      // Check ETH balances of A, B, C have increased by the value of their ETH gain from liquidations, respectively
      const alice_expectedETHBalance = alice_ETH_Balance_Before.add(alice_ETHGain_Before).toString();
      const bob_expectedETHBalance = bob_ETH_Balance_Before.add(bob_ETHGain_Before).toString();
      const carol_expectedETHBalance = carol_ETH_Balance_Before.add(carol_ETHGain_Before).toString();

      const alice_ETHBalance_After = (await web3.eth.getBalance(alice)).toString();
      const bob_ETHBalance_After = (await web3.eth.getBalance(bob)).toString();
      const carol_ETHBalance_After = (await web3.eth.getBalance(carol)).toString();

      // ETH balances before minus gas used
      const alice_ETHBalance_After_Gas = alice_ETHBalance_After - A_GAS_Used;
      const bob_ETHBalance_After_Gas = bob_ETHBalance_After - B_GAS_Used;
      const carol_ETHBalance_After_Gas = carol_ETHBalance_After - C_GAS_Used;

      assert.equal(alice_expectedETHBalance, alice_ETHBalance_After_Gas);
      assert.equal(bob_expectedETHBalance, bob_ETHBalance_After_Gas);
      assert.equal(carol_expectedETHBalance, carol_ETHBalance_After_Gas);

      // Check ARTH in Stability Pool has been reduced by A, B and C's compounded deposit
      const expectedARTHinSP = ARTHinSP_Before.sub(alice_Deposit_Before)
        .sub(bob_Deposit_Before)
        .sub(carol_Deposit_Before)
        .toString();
      const ARTHinSP_After = (await stabilityPool.getTotalARTHDeposits()).toString();
      assert.equal(ARTHinSP_After, expectedARTHinSP);

      // Check ETH in SP has reduced to zero
      const ETHinSP_After = (await stabilityPool.getETH()).toString();
      assert.isAtMost(th.getDifference(ETHinSP_After, "0"), 100000);
    });

    it("getDepositorETHGain(): depositor does not earn further ETH gains from liquidations while their compounded deposit == 0: ", async () => {
      await openTrove({
        extraARTHAmount: toBN(dec(1, 24)),
        ICR: toBN(dec(10, 18)),
        extraParams: { from: whale }
      });

      // A, B, C open troves
      await openTrove({
        extraARTHAmount: toBN(dec(10000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: alice }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(20000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: bob }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(30000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: carol }
      });

      // defaulters open troves
      await openTrove({
        extraARTHAmount: toBN(dec(15000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: defaulter_1 }
      });
      await openTrove({ ICR: toBN(dec(2, 18)), extraParams: { from: defaulter_2 } });
      await openTrove({ ICR: toBN(dec(2, 18)), extraParams: { from: defaulter_3 } });

      // A, B, provide 10000, 5000 ARTH to SP
      await stabilityPool.provideToSP(dec(10000, 18), frontEnd_1, { from: alice });
      await stabilityPool.provideToSP(dec(5000, 18), frontEnd_1, { from: bob });

      //price drops
      await priceFeed.setPrice(dec(105, 18));

      // Liquidate defaulter 1. Empties the Pool
      await troveManager.liquidate(defaulter_1);
      assert.isFalse(await sortedTroves.contains(defaulter_1));

      const ARTHinSP = (await stabilityPool.getTotalARTHDeposits()).toString();
      assert.equal(ARTHinSP, "0");

      // Check Stability deposits have been fully cancelled with debt, and are now all zero
      const alice_Deposit = (await stabilityPool.getCompoundedARTHDeposit(alice)).toString();
      const bob_Deposit = (await stabilityPool.getCompoundedARTHDeposit(bob)).toString();

      assert.equal(alice_Deposit, "0");
      assert.equal(bob_Deposit, "0");

      // Get ETH gain for A and B
      const alice_ETHGain_1 = (await stabilityPool.getDepositorETHGain(alice)).toString();
      const bob_ETHGain_1 = (await stabilityPool.getDepositorETHGain(bob)).toString();

      // Whale deposits 10000 ARTH to Stability Pool
      await stabilityPool.provideToSP(dec(1, 24), frontEnd_1, { from: whale });

      // Liquidation 2
      await troveManager.liquidate(defaulter_2);
      assert.isFalse(await sortedTroves.contains(defaulter_2));

      // Check Alice and Bob have not received ETH gain from liquidation 2 while their deposit was 0
      const alice_ETHGain_2 = (await stabilityPool.getDepositorETHGain(alice)).toString();
      const bob_ETHGain_2 = (await stabilityPool.getDepositorETHGain(bob)).toString();

      assert.equal(alice_ETHGain_1, alice_ETHGain_2);
      assert.equal(bob_ETHGain_1, bob_ETHGain_2);

      // Liquidation 3
      await troveManager.liquidate(defaulter_3);
      assert.isFalse(await sortedTroves.contains(defaulter_3));

      // Check Alice and Bob have not received ETH gain from liquidation 3 while their deposit was 0
      const alice_ETHGain_3 = (await stabilityPool.getDepositorETHGain(alice)).toString();
      const bob_ETHGain_3 = (await stabilityPool.getDepositorETHGain(bob)).toString();

      assert.equal(alice_ETHGain_1, alice_ETHGain_3);
      assert.equal(bob_ETHGain_1, bob_ETHGain_3);
    });

    it("withdrawFromSP(), partial withdrawal: tagged front end's stake decreases", async () => {
      await openTrove({
        extraARTHAmount: toBN(dec(10000, 18)),
        ICR: toBN(dec(10, 18)),
        extraParams: { from: whale }
      });

      // A, B, C, D, E, F open troves
      await openTrove({
        extraARTHAmount: toBN(dec(10000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: A }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(20000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: B }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(30000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: C }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(10000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: D }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(20000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: E }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(30000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: F }
      });

      // A, B, C, D, E, F provide to SP
      await stabilityPool.provideToSP(dec(10, 18), frontEnd_1, { from: A });
      await stabilityPool.provideToSP(dec(20, 18), frontEnd_2, { from: B });
      await stabilityPool.provideToSP(dec(30, 18), frontEnd_3, { from: C });
      await stabilityPool.provideToSP(dec(10, 18), frontEnd_1, { from: D });
      await stabilityPool.provideToSP(dec(20, 18), frontEnd_2, { from: E });
      await stabilityPool.provideToSP(dec(30, 18), frontEnd_3, { from: F });

      await th.fastForwardTime(timeValues.SECONDS_IN_ONE_HOUR, web3.currentProvider);

      // Get front ends' stake before
      const F1_Stake_Before = await stabilityPool.frontEndStakes(frontEnd_1);
      const F2_Stake_Before = await stabilityPool.frontEndStakes(frontEnd_2);
      const F3_Stake_Before = await stabilityPool.frontEndStakes(frontEnd_3);

      // A, B, C withdraw
      await stabilityPool.withdrawFromSP(dec(1, 18), { from: A });
      await stabilityPool.withdrawFromSP(dec(2, 18), { from: B });
      await stabilityPool.withdrawFromSP(dec(3, 18), { from: C });

      // Get front ends' stakes after
      const F1_Stake_After = await stabilityPool.frontEndStakes(frontEnd_1);
      const F2_Stake_After = await stabilityPool.frontEndStakes(frontEnd_2);
      const F3_Stake_After = await stabilityPool.frontEndStakes(frontEnd_3);

      // Check front ends' stakes have decreased
      assert.isTrue(F1_Stake_After.lt(F1_Stake_Before));
      assert.isTrue(F2_Stake_After.lt(F2_Stake_Before));
      assert.isTrue(F3_Stake_After.lt(F3_Stake_Before));
    });

    it("withdrawFromSP(), full withdrawal: removes deposit's front end tag", async () => {
      await openTrove({
        extraARTHAmount: toBN(dec(100000, 18)),
        ICR: toBN(dec(10, 18)),
        extraParams: { from: whale }
      });

      // Whale transfers to A, B
      await arthToken.transfer(A, dec(10000, 18), { from: whale });
      await arthToken.transfer(B, dec(20000, 18), { from: whale });

      //C, D open troves
      await openTrove({
        extraARTHAmount: toBN(dec(30000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: C }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(40000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: D }
      });

      // A, B, C, D make their initial deposits
      await stabilityPool.provideToSP(dec(10000, 18), frontEnd_1, { from: A });
      await stabilityPool.provideToSP(dec(20000, 18), ZERO_ADDRESS, { from: B });
      await stabilityPool.provideToSP(dec(30000, 18), frontEnd_2, { from: C });
      await stabilityPool.provideToSP(dec(40000, 18), ZERO_ADDRESS, { from: D });

      // Check deposits are tagged with correct front end
      const A_tagBefore = await getFrontEndTag(stabilityPool, A);
      const B_tagBefore = await getFrontEndTag(stabilityPool, B);
      const C_tagBefore = await getFrontEndTag(stabilityPool, C);
      const D_tagBefore = await getFrontEndTag(stabilityPool, D);

      assert.equal(A_tagBefore, frontEnd_1);
      assert.equal(B_tagBefore, ZERO_ADDRESS);
      assert.equal(C_tagBefore, frontEnd_2);
      assert.equal(D_tagBefore, ZERO_ADDRESS);

      // All depositors make full withdrawal
      await stabilityPool.withdrawFromSP(dec(10000, 18), { from: A });
      await stabilityPool.withdrawFromSP(dec(20000, 18), { from: B });
      await stabilityPool.withdrawFromSP(dec(30000, 18), { from: C });
      await stabilityPool.withdrawFromSP(dec(40000, 18), { from: D });

      // Check all deposits now have no front end tag
      const A_tagAfter = await getFrontEndTag(stabilityPool, A);
      const B_tagAfter = await getFrontEndTag(stabilityPool, B);
      const C_tagAfter = await getFrontEndTag(stabilityPool, C);
      const D_tagAfter = await getFrontEndTag(stabilityPool, D);

      assert.equal(A_tagAfter, ZERO_ADDRESS);
      assert.equal(B_tagAfter, ZERO_ADDRESS);
      assert.equal(C_tagAfter, ZERO_ADDRESS);
      assert.equal(D_tagAfter, ZERO_ADDRESS);
    });

    // --- withdrawETHGainToTrove ---

    it("withdrawETHGainToTrove(): reverts when user has no active deposit", async () => {
      await openTrove({
        extraARTHAmount: toBN(dec(100000, 18)),
        ICR: toBN(dec(10, 18)),
        extraParams: { from: whale }
      });

      await openTrove({
        extraARTHAmount: toBN(dec(10000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: alice }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(10000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: bob }
      });
      console.log((await arthToken.balanceOf(alice)).toString())
      await stabilityPool.provideToSP(dec(250, 18), frontEnd_1, { from: alice });

      const alice_initialDeposit = (await stabilityPool.deposits(alice))[0].toString();
      const bob_initialDeposit = (await stabilityPool.deposits(bob))[0].toString();

      assert.equal(alice_initialDeposit, dec(250, 18));
      assert.equal(bob_initialDeposit, "0");

      // Defaulter opens a trove, price drops, defaulter gets liquidated
      await openTrove({ ICR: toBN(dec(2, 18)), extraParams: { from: defaulter_1 } });
      await priceFeed.setPrice(dec(105, 18));
      assert.isFalse(await th.checkRecoveryMode(contracts));
      await troveManager.liquidate(defaulter_1);
      assert.isFalse(await sortedTroves.contains(defaulter_1));
    //   const txAlice = await stabilityPool.withdrawETHGainToTrove(alice, alice, { from: alice });
    //   assert.isTrue(txAlice.receipt.status);

      const txPromise_B = stabilityPool.withdrawETHGainToTrove(bob, bob, { from: bob });
      await th.assertRevert(txPromise_B);
    });

    it("withdrawETHGainToTrove(): Applies ARTHLoss to user's deposit, and redirects ETH reward to user's Trove", async () => {
      // --- SETUP ---
      // Whale deposits 185000 ARTH in StabilityPool
      await openTrove({
        extraARTHAmount: toBN(dec(1000000, 18)),
        ICR: toBN(dec(10, 18)),
        extraParams: { from: whale }
      });
      await stabilityPool.provideToSP(dec(185000, 18), frontEnd_1, { from: whale });

      // Defaulter opens trove
      await openTrove({ ICR: toBN(dec(2, 18)), extraParams: { from: defaulter_1 } });

      // --- TEST ---

      // Alice makes deposit #1: 15000 ARTH
      await openTrove({
        extraARTHAmount: toBN(dec(15000, 18)),
        ICR: toBN(dec(10, 18)),
        extraParams: { from: alice }
      });
      await stabilityPool.provideToSP(dec(15000, 18), frontEnd_1, { from: alice });

      // check Alice's Trove recorded ETH Before:
      const aliceTrove_Before = await troveManager.Troves(alice);
      const aliceTrove_ETH_Before = aliceTrove_Before[1];
      assert.isTrue(aliceTrove_ETH_Before.gt(toBN("0")));

      // price drops: defaulter's Trove falls below MCR, alice and whale Trove remain active
      await priceFeed.setPrice(dec(105, 18));

      // Defaulter's Trove is closed
      const liquidationTx_1 = await troveManager.liquidate(defaulter_1, { from: owner });
      const [liquidatedDebt, liquidatedColl, ,] = th.getEmittedLiquidationValues(liquidationTx_1);

      const ETHGain_A = await stabilityPool.getDepositorETHGain(alice);
      const compoundedDeposit_A = await stabilityPool.getCompoundedARTHDeposit(alice);

      // Alice should receive rewards proportional to her deposit as share of total deposits
      const expectedETHGain_A = liquidatedColl.mul(toBN(dec(15000, 18))).div(toBN(dec(200000, 18)));
      const expectedARTHLoss_A = liquidatedDebt.mul(toBN(dec(15000, 18))).div(toBN(dec(200000, 18)));
      const expectedCompoundedDeposit_A = toBN(dec(15000, 18)).sub(expectedARTHLoss_A);

      assert.isAtMost(th.getDifference(expectedCompoundedDeposit_A, compoundedDeposit_A), 100000);

      // Alice sends her ETH Gains to her Trove
      await stabilityPool.withdrawETHGainToTrove(alice, alice, { from: alice });

      // check Alice's ARTHLoss has been applied to her deposit expectedCompoundedDeposit_A
      alice_deposit_afterDefault = (await stabilityPool.deposits(alice))[0];
      assert.isAtMost(
        th.getDifference(alice_deposit_afterDefault, expectedCompoundedDeposit_A),
        100000
      );

      // check alice's Trove recorded ETH has increased by the expected reward amount
      const aliceTrove_After = await troveManager.Troves(alice);
      const aliceTrove_ETH_After = aliceTrove_After[1];

      const Trove_ETH_Increase = aliceTrove_ETH_After.sub(aliceTrove_ETH_Before).toString();

      assert.equal(Trove_ETH_Increase, ETHGain_A);
    });

    it("withdrawETHGainToTrove(): reverts if it would leave trove with ICR < MCR", async () => {
      // --- SETUP ---
      // Whale deposits 1850 ARTH in StabilityPool
      await openTrove({
        extraARTHAmount: toBN(dec(1000000, 18)),
        ICR: toBN(dec(10, 18)),
        extraParams: { from: whale }
      });
      await stabilityPool.provideToSP(dec(185000, 18), frontEnd_1, { from: whale });

      // defaulter opened
      await openTrove({ ICR: toBN(dec(2, 18)), extraParams: { from: defaulter_1 } });

      // --- TEST ---

      // Alice makes deposit #1: 15000 ARTH
      await openTrove({
        extraARTHAmount: toBN(dec(15000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: alice }
      });
      await stabilityPool.provideToSP(dec(15000, 18), frontEnd_1, { from: alice });

      // check alice's Trove recorded ETH Before:
      const aliceTrove_Before = await troveManager.Troves(alice);
      const aliceTrove_ETH_Before = aliceTrove_Before[1];
      assert.isTrue(aliceTrove_ETH_Before.gt(toBN("0")));

      // price drops: defaulter's Trove falls below MCR
      await priceFeed.setPrice(dec(10, 18));

      // defaulter's Trove is closed.
      await troveManager.liquidate(defaulter_1, { from: owner });

      // Alice attempts to  her ETH Gains to her Trove
      await assertRevert(
        stabilityPool.withdrawETHGainToTrove(alice, alice, { from: alice }),
        "BorrowerOps: An operation that would result in ICR < MCR is not permitted"
      );
    });

    it("withdrawETHGainToTrove(): Subsequent deposit and withdrawal attempt from same account, with no intermediate liquidations, withdraws zero ETH", async () => {
      // --- SETUP ---
      // Whale deposits 1850 ARTH in StabilityPool
      await openTrove({
        extraARTHAmount: toBN(dec(1000000, 18)),
        ICR: toBN(dec(10, 18)),
        extraParams: { from: whale }
      });
      await stabilityPool.provideToSP(dec(185000, 18), frontEnd_1, { from: whale });

      // defaulter opened
      await openTrove({ ICR: toBN(dec(2, 18)), extraParams: { from: defaulter_1 } });

      // --- TEST ---

      // Alice makes deposit #1: 15000 ARTH
      await openTrove({
        extraARTHAmount: toBN(dec(15000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: alice }
      });
      await stabilityPool.provideToSP(dec(15000, 18), frontEnd_1, { from: alice });

      // check alice's Trove recorded ETH Before:
      const aliceTrove_Before = await troveManager.Troves(alice);
      const aliceTrove_ETH_Before = aliceTrove_Before[1];
      assert.isTrue(aliceTrove_ETH_Before.gt(toBN("0")));

      // price drops: defaulter's Trove falls below MCR
      await priceFeed.setPrice(dec(105, 18));

      // defaulter's Trove is closed.
      await troveManager.liquidate(defaulter_1, { from: owner });

      // price bounces back
      await priceFeed.setPrice(dec(200, 18));

      // Alice sends her ETH Gains to her Trove
      await stabilityPool.withdrawETHGainToTrove(alice, alice, { from: alice });

      assert.equal(await stabilityPool.getDepositorETHGain(alice), 0);

      const ETHinSP_Before = (await stabilityPool.getETH()).toString();

      // Alice attempts second withdrawal from SP to Trove - reverts, due to 0 ETH Gain
      const txPromise_A = stabilityPool.withdrawETHGainToTrove(alice, alice, { from: alice });
      await th.assertRevert(txPromise_A);

      // Check ETH in pool does not change
      const ETHinSP_1 = (await stabilityPool.getETH()).toString();
      assert.equal(ETHinSP_Before, ETHinSP_1);

      await priceFeed.setPrice(dec(200, 18));

      // Alice attempts third withdrawal (this time, from SP to her own account)
      await stabilityPool.withdrawFromSP(dec(15000, 18), { from: alice });

      // Check ETH in pool does not change
      const ETHinSP_2 = (await stabilityPool.getETH()).toString();
      assert.equal(ETHinSP_Before, ETHinSP_2);
    });

    it("withdrawETHGainToTrove(): decreases StabilityPool ETH and increases activePool ETH", async () => {
      // --- SETUP ---
      // Whale deposits 185000 ARTH in StabilityPool
      await openTrove({
        extraARTHAmount: toBN(dec(1000000, 18)),
        ICR: toBN(dec(10, 18)),
        extraParams: { from: whale }
      });
      await stabilityPool.provideToSP(dec(185000, 18), frontEnd_1, { from: whale });

      // defaulter opened
      await openTrove({ ICR: toBN(dec(2, 18)), extraParams: { from: defaulter_1 } });

      // --- TEST ---

      // Alice makes deposit #1: 15000 ARTH
      await openTrove({
        extraARTHAmount: toBN(dec(15000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: alice }
      });
      await stabilityPool.provideToSP(dec(15000, 18), frontEnd_1, { from: alice });

      // price drops: defaulter's Trove falls below MCR
      await priceFeed.setPrice(dec(100, 18));

      // defaulter's Trove is closed.
      const liquidationTx = await troveManager.liquidate(defaulter_1);
      const [liquidatedDebt, liquidatedColl, gasComp] = th.getEmittedLiquidationValues(
        liquidationTx
      );

      // Expect alice to be entitled to 15000/200000 of the liquidated coll
      const aliceExpectedETHGain = liquidatedColl
        .mul(toBN(dec(15000, 18)))
        .div(toBN(dec(200000, 18)));
      const aliceETHGain = await stabilityPool.getDepositorETHGain(alice);
      assert.isTrue(aliceExpectedETHGain.eq(aliceETHGain));

      // price bounces back
      await priceFeed.setPrice(dec(200, 18));

      //check activePool and StabilityPool Ether before retrieval:
      const active_ETH_Before = await activePool.getETH();
      const stability_ETH_Before = await stabilityPool.getETH();

      // Alice retrieves redirects ETH gain to her Trove
      await stabilityPool.withdrawETHGainToTrove(alice, alice, { from: alice });

      const active_ETH_After = await activePool.getETH();
      const stability_ETH_After = await stabilityPool.getETH();

      const active_ETH_Difference = active_ETH_After.sub(active_ETH_Before); // AP ETH should increase
      const stability_ETH_Difference = stability_ETH_Before.sub(stability_ETH_After); // SP ETH should decrease

      // check Pool ETH values change by Alice's ETHGain, i.e 0.075 ETH
      assert.isAtMost(th.getDifference(active_ETH_Difference, aliceETHGain), 10000);
      assert.isAtMost(th.getDifference(stability_ETH_Difference, aliceETHGain), 10000);
    });

    it("withdrawETHGainToTrove(): All depositors are able to withdraw their ETH gain from the SP to their Trove", async () => {
      // Whale opens trove
      await openTrove({
        extraARTHAmount: toBN(dec(100000, 18)),
        ICR: toBN(dec(10, 18)),
        extraParams: { from: whale }
      });

      // Defaulter opens trove
      await openTrove({ ICR: toBN(dec(2, 18)), extraParams: { from: defaulter_1 } });

      // 6 Accounts open troves and provide to SP
      const depositors = [alice, bob, carol, dennis, erin, flyn];
      for (account of depositors) {
        await openTrove({
          extraARTHAmount: toBN(dec(10000, 18)),
          ICR: toBN(dec(2, 18)),
          extraParams: { from: account }
        });
        await stabilityPool.provideToSP(dec(10000, 18), frontEnd_1, { from: account });
      }

      await priceFeed.setPrice(dec(105, 18));
      await troveManager.liquidate(defaulter_1);

      // price bounces back
      await priceFeed.setPrice(dec(200, 18));

      // All depositors attempt to withdraw
      const tx1 = await stabilityPool.withdrawETHGainToTrove(alice, alice, { from: alice });
      assert.isTrue(tx1.receipt.status);
      const tx2 = await stabilityPool.withdrawETHGainToTrove(bob, bob, { from: bob });
      assert.isTrue(tx1.receipt.status);
      const tx3 = await stabilityPool.withdrawETHGainToTrove(carol, carol, { from: carol });
      assert.isTrue(tx1.receipt.status);
      const tx4 = await stabilityPool.withdrawETHGainToTrove(dennis, dennis, { from: dennis });
      assert.isTrue(tx1.receipt.status);
      const tx5 = await stabilityPool.withdrawETHGainToTrove(erin, erin, { from: erin });
      assert.isTrue(tx1.receipt.status);
      const tx6 = await stabilityPool.withdrawETHGainToTrove(flyn, flyn, { from: flyn });
      assert.isTrue(tx1.receipt.status);
    });

    it("withdrawETHGainToTrove(): All depositors withdraw, each withdraw their correct ETH gain", async () => {
      // Whale opens trove
      await openTrove({
        extraARTHAmount: toBN(dec(100000, 18)),
        ICR: toBN(dec(10, 18)),
        extraParams: { from: whale }
      });

      // defaulter opened
      await openTrove({ ICR: toBN(dec(2, 18)), extraParams: { from: defaulter_1 } });

      // 6 Accounts open troves and provide to SP
      const depositors = [alice, bob, carol, dennis, erin, flyn];
      for (account of depositors) {
        await openTrove({
          extraARTHAmount: toBN(dec(10000, 18)),
          ICR: toBN(dec(2, 18)),
          extraParams: { from: account }
        });
        await stabilityPool.provideToSP(dec(10000, 18), frontEnd_1, { from: account });
      }
      const collBefore = (await troveManager.Troves(alice))[1]; // all troves have same coll before

      await priceFeed.setPrice(dec(105, 18));
      const liquidationTx = await troveManager.liquidate(defaulter_1);
      const [, liquidatedColl, ,] = th.getEmittedLiquidationValues(liquidationTx);

      /* All depositors attempt to withdraw their ETH gain to their Trove. Each depositor
      receives (liquidatedColl/ 6).

      Thus, expected new collateral for each depositor with 1 Ether in their trove originally, is
      (1 + liquidatedColl/6)
      */

      const expectedCollGain = liquidatedColl.div(toBN("6"));

      await priceFeed.setPrice(dec(200, 18));

      await stabilityPool.withdrawETHGainToTrove(alice, alice, { from: alice });
      const aliceCollAfter = (await troveManager.Troves(alice))[1];
      assert.isAtMost(th.getDifference(aliceCollAfter.sub(collBefore), expectedCollGain), 10000);

      await stabilityPool.withdrawETHGainToTrove(bob, bob, { from: bob });
      const bobCollAfter = (await troveManager.Troves(bob))[1];
      assert.isAtMost(th.getDifference(bobCollAfter.sub(collBefore), expectedCollGain), 10000);

      await stabilityPool.withdrawETHGainToTrove(carol, carol, { from: carol });
      const carolCollAfter = (await troveManager.Troves(carol))[1];
      assert.isAtMost(th.getDifference(carolCollAfter.sub(collBefore), expectedCollGain), 10000);

      await stabilityPool.withdrawETHGainToTrove(dennis, dennis, { from: dennis });
      const dennisCollAfter = (await troveManager.Troves(dennis))[1];
      assert.isAtMost(th.getDifference(dennisCollAfter.sub(collBefore), expectedCollGain), 10000);

      await stabilityPool.withdrawETHGainToTrove(erin, erin, { from: erin });
      const erinCollAfter = (await troveManager.Troves(erin))[1];
      assert.isAtMost(th.getDifference(erinCollAfter.sub(collBefore), expectedCollGain), 10000);

      await stabilityPool.withdrawETHGainToTrove(flyn, flyn, { from: flyn });
      const flynCollAfter = (await troveManager.Troves(flyn))[1];
      assert.isAtMost(th.getDifference(flynCollAfter.sub(collBefore), expectedCollGain), 10000);
    });

    it("withdrawETHGainToTrove(): caller can withdraw full deposit and ETH gain to their trove during Recovery Mode", async () => {
      // --- SETUP ---

      // Defaulter opens
      await openTrove({ ICR: toBN(dec(2, 18)), extraParams: { from: defaulter_1 } });

      // A, B, C open troves
      await openTrove({
        extraARTHAmount: toBN(dec(10000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: alice }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(20000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: bob }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(30000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: carol }
      });

      // A, B, C provides 10000, 5000, 3000 ARTH to SP
      await stabilityPool.provideToSP(dec(10000, 18), frontEnd_1, { from: alice });
      await stabilityPool.provideToSP(dec(5000, 18), frontEnd_1, { from: bob });
      await stabilityPool.provideToSP(dec(3000, 18), frontEnd_1, { from: carol });

      assert.isFalse(await th.checkRecoveryMode(contracts));

      // Price drops to 105,
      await priceFeed.setPrice(dec(105, 18));
      const price = await priceFeed.getPrice();

      assert.isTrue(await th.checkRecoveryMode(contracts));

      // Check defaulter 1 has ICR: 100% < ICR < 110%.
      assert.isTrue(await th.ICRbetween100and110(defaulter_1, troveManager, price));

      const alice_Collateral_Before = (await troveManager.Troves(alice))[1];
      const bob_Collateral_Before = (await troveManager.Troves(bob))[1];
      const carol_Collateral_Before = (await troveManager.Troves(carol))[1];

      // Liquidate defaulter 1
      assert.isTrue(await sortedTroves.contains(defaulter_1));
      await troveManager.liquidate(defaulter_1);
      assert.isFalse(await sortedTroves.contains(defaulter_1));

      const alice_ETHGain_Before = await stabilityPool.getDepositorETHGain(alice);
      const bob_ETHGain_Before = await stabilityPool.getDepositorETHGain(bob);
      const carol_ETHGain_Before = await stabilityPool.getDepositorETHGain(carol);

      // A, B, C withdraw their full ETH gain from the Stability Pool to their trove
      await stabilityPool.withdrawETHGainToTrove(alice, alice, { from: alice });
      await stabilityPool.withdrawETHGainToTrove(bob, bob, { from: bob });
      await stabilityPool.withdrawETHGainToTrove(carol, carol, { from: carol });

      // Check collateral of troves A, B, C has increased by the value of their ETH gain from liquidations, respectively
      const alice_expectedCollateral = alice_Collateral_Before.add(alice_ETHGain_Before).toString();
      const bob_expectedColalteral = bob_Collateral_Before.add(bob_ETHGain_Before).toString();
      const carol_expectedCollateral = carol_Collateral_Before.add(carol_ETHGain_Before).toString();

      const alice_Collateral_After = (await troveManager.Troves(alice))[1];
      const bob_Collateral_After = (await troveManager.Troves(bob))[1];
      const carol_Collateral_After = (await troveManager.Troves(carol))[1];

      assert.equal(alice_expectedCollateral, alice_Collateral_After);
      assert.equal(bob_expectedColalteral, bob_Collateral_After);
      assert.equal(carol_expectedCollateral, carol_Collateral_After);

      // Check ETH in SP has reduced to zero
      const ETHinSP_After = (await stabilityPool.getETH()).toString();
      assert.isAtMost(th.getDifference(ETHinSP_After, "0"), 100000);
    });

    it("withdrawETHGainToTrove(): reverts if user has no trove", async () => {
      await openTrove({
        extraARTHAmount: toBN(dec(10000, 18)),
        ICR: toBN(dec(10, 18)),
        extraParams: { from: whale }
      });

      // A, B, C open troves
      await openTrove({
        extraARTHAmount: toBN(dec(10000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: alice }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(20000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: bob }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(30000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: carol }
      });

      // Defaulter opens
      await openTrove({ ICR: toBN(dec(2, 18)), extraParams: { from: defaulter_1 } });

      // A transfers ARTH to D
      await arthToken.transfer(dennis, dec(10000, 18), { from: alice });

      // D deposits to Stability Pool
      await stabilityPool.provideToSP(dec(10000, 18), frontEnd_1, { from: dennis });

      //Price drops
      await priceFeed.setPrice(dec(105, 18));

      //Liquidate defaulter 1
      await troveManager.liquidate(defaulter_1);
      assert.isFalse(await sortedTroves.contains(defaulter_1));

      await priceFeed.setPrice(dec(200, 18));

      // D attempts to withdraw his ETH gain to Trove
      await th.assertRevert(
        stabilityPool.withdrawETHGainToTrove(dennis, dennis, { from: dennis }),
        "caller must have an active trove to withdraw ETHGain to"
      );
    });

    it("withdrawETHGainToTrove(), eligible deposit: tagged front end's stake decreases", async () => {
      await openTrove({
        extraARTHAmount: toBN(dec(100000, 18)),
        ICR: toBN(dec(10, 18)),
        extraParams: { from: whale }
      });

      // A, B, C, D, E, F open troves
      await openTrove({
        extraARTHAmount: toBN(dec(10000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: A }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(20000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: B }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(30000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: C }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(10000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: D }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(20000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: E }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(30000, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: F }
      });

      // A, B, C, D, E, F provide to SP
      await stabilityPool.provideToSP(dec(1000, 18), frontEnd_1, { from: A });
      await stabilityPool.provideToSP(dec(2000, 18), frontEnd_2, { from: B });
      await stabilityPool.provideToSP(dec(3000, 18), frontEnd_3, { from: C });
      await stabilityPool.provideToSP(dec(1000, 18), frontEnd_1, { from: D });
      await stabilityPool.provideToSP(dec(2000, 18), frontEnd_2, { from: E });
      await stabilityPool.provideToSP(dec(3000, 18), frontEnd_3, { from: F });

      // Defaulter opens a trove, price drops, defaulter gets liquidated
      await openTrove({ ICR: toBN(dec(2, 18)), extraParams: { from: defaulter_1 } });
      await priceFeed.setPrice(dec(105, 18));
      assert.isFalse(await th.checkRecoveryMode(contracts));
      await troveManager.liquidate(defaulter_1);
      assert.isFalse(await sortedTroves.contains(defaulter_1));

      await th.fastForwardTime(timeValues.SECONDS_IN_ONE_HOUR, web3.currentProvider);

      // Get front ends' stake before
      const F1_Stake_Before = await stabilityPool.frontEndStakes(frontEnd_1);
      const F2_Stake_Before = await stabilityPool.frontEndStakes(frontEnd_2);
      const F3_Stake_Before = await stabilityPool.frontEndStakes(frontEnd_3);

      await priceFeed.setPrice(dec(200, 18));

      // Check A, B, C have non-zero ETH gain
      assert.isTrue((await stabilityPool.getDepositorETHGain(A)).gt(ZERO));
      assert.isTrue((await stabilityPool.getDepositorETHGain(B)).gt(ZERO));
      assert.isTrue((await stabilityPool.getDepositorETHGain(C)).gt(ZERO));

      // A, B, C withdraw to trove
      await stabilityPool.withdrawETHGainToTrove(A, A, { from: A });
      await stabilityPool.withdrawETHGainToTrove(B, B, { from: B });
      await stabilityPool.withdrawETHGainToTrove(C, C, { from: C });

      // Get front ends' stakes after
      const F1_Stake_After = await stabilityPool.frontEndStakes(frontEnd_1);
      const F2_Stake_After = await stabilityPool.frontEndStakes(frontEnd_2);
      const F3_Stake_After = await stabilityPool.frontEndStakes(frontEnd_3);

      // Check front ends' stakes have decreased
      assert.isTrue(F1_Stake_After.lt(F1_Stake_Before));
      assert.isTrue(F2_Stake_After.lt(F2_Stake_Before));
      assert.isTrue(F3_Stake_After.lt(F3_Stake_Before));
    });

    it("registerFrontEnd(): registers the front end and chosen kickback rate", async () => {
      const unregisteredFrontEnds = [A, B, C, D, E];

      for (const frontEnd of unregisteredFrontEnds) {
        assert.isFalse((await stabilityPool.frontEnds(frontEnd))[1]); // check inactive
        assert.equal((await stabilityPool.frontEnds(frontEnd))[0], "0"); // check no chosen kickback rate
      }

      await stabilityPool.registerFrontEnd(dec(1, 18), { from: A });
      await stabilityPool.registerFrontEnd("897789897897897", { from: B });
      await stabilityPool.registerFrontEnd("99990098", { from: C });
      await stabilityPool.registerFrontEnd("37", { from: D });
      await stabilityPool.registerFrontEnd("0", { from: E });

      // Check front ends are registered as active, and have correct kickback rates
      assert.isTrue((await stabilityPool.frontEnds(A))[1]);
      assert.equal((await stabilityPool.frontEnds(A))[0], dec(1, 18));

      assert.isTrue((await stabilityPool.frontEnds(B))[1]);
      assert.equal((await stabilityPool.frontEnds(B))[0], "897789897897897");

      assert.isTrue((await stabilityPool.frontEnds(C))[1]);
      assert.equal((await stabilityPool.frontEnds(C))[0], "99990098");

      assert.isTrue((await stabilityPool.frontEnds(D))[1]);
      assert.equal((await stabilityPool.frontEnds(D))[0], "37");

      assert.isTrue((await stabilityPool.frontEnds(E))[1]);
      assert.equal((await stabilityPool.frontEnds(E))[0], "0");
    });

    it("registerFrontEnd(): reverts if the front end is already registered", async () => {
      await stabilityPool.registerFrontEnd(dec(1, 18), { from: A });
      await stabilityPool.registerFrontEnd("897789897897897", { from: B });
      await stabilityPool.registerFrontEnd("99990098", { from: C });

      const _2ndAttempt_A = stabilityPool.registerFrontEnd(dec(1, 18), { from: A });
      const _2ndAttempt_B = stabilityPool.registerFrontEnd("897789897897897", { from: B });
      const _2ndAttempt_C = stabilityPool.registerFrontEnd("99990098", { from: C });

      await th.assertRevert(
        _2ndAttempt_A,
        "StabilityPool: must not already be a registered front end"
      );
      await th.assertRevert(
        _2ndAttempt_B,
        "StabilityPool: must not already be a registered front end"
      );
      await th.assertRevert(
        _2ndAttempt_C,
        "StabilityPool: must not already be a registered front end"
      );
    });

    it("registerFrontEnd(): reverts if the kickback rate >1", async () => {
      const invalidKickbackTx_A = stabilityPool.registerFrontEnd(dec(1, 19), { from: A });
      const invalidKickbackTx_B = stabilityPool.registerFrontEnd("1000000000000000001", { from: A });
      const invalidKickbackTx_C = stabilityPool.registerFrontEnd(dec(23423, 45), { from: A });
      const invalidKickbackTx_D = stabilityPool.registerFrontEnd(maxBytes32, { from: A });

      await th.assertRevert(
        invalidKickbackTx_A,
        "StabilityPool: Kickback rate must be in range [0,1]"
      );
      await th.assertRevert(
        invalidKickbackTx_B,
        "StabilityPool: Kickback rate must be in range [0,1]"
      );
      await th.assertRevert(
        invalidKickbackTx_C,
        "StabilityPool: Kickback rate must be in range [0,1]"
      );
      await th.assertRevert(
        invalidKickbackTx_D,
        "StabilityPool: Kickback rate must be in range [0,1]"
      );
    });

    it("registerFrontEnd(): reverts if address has a non-zero deposit already", async () => {
      // C, D, E open troves
      await openTrove({
        extraARTHAmount: toBN(dec(10, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: C }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(10, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: D }
      });
      await openTrove({
        extraARTHAmount: toBN(dec(10, 18)),
        ICR: toBN(dec(2, 18)),
        extraParams: { from: E }
      });

      // C, E provides to SP
      await stabilityPool.provideToSP(dec(10, 18), frontEnd_1, { from: C });
      await stabilityPool.provideToSP(dec(10, 18), ZERO_ADDRESS, { from: E });

      const txPromise_C = stabilityPool.registerFrontEnd(dec(1, 18), { from: C });
      const txPromise_E = stabilityPool.registerFrontEnd(dec(1, 18), { from: E });
      await th.assertRevert(txPromise_C, "StabilityPool: User must have no deposit");
      await th.assertRevert(txPromise_E, "StabilityPool: User must have no deposit");

      // D, with no deposit, successfully registers a front end
      const txD = await stabilityPool.registerFrontEnd(dec(1, 18), { from: D });
      assert.isTrue(txD.receipt.status);
    });
  });
});

contract("Reset chain state", async accounts => {});