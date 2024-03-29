const deploymentHelper = require("../utils/deploymentHelpers.js");
const testHelpers = require("../utils/testHelpers.js");

const { keccak256 } = require("@ethersproject/keccak256");
const { defaultAbiCoder } = require("@ethersproject/abi");
const { toUtf8Bytes } = require("@ethersproject/strings");
const { pack } = require("@ethersproject/solidity");
const { hexlify } = require("@ethersproject/bytes");
const { ecsign } = require("ethereumjs-util");

const { toBN, assertRevert, assertAssert, dec, ZERO_ADDRESS } = testHelpers.TestHelper;

const sign = (digest, privateKey) => {
  return ecsign(Buffer.from(digest.slice(2), "hex"), Buffer.from(privateKey.slice(2), "hex"));
};

const PERMIT_TYPEHASH = keccak256(
  toUtf8Bytes("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)")
);

// Gets the EIP712 domain separator
const getDomainSeparator = (name, contractAddress, chainId, version) => {
  return keccak256(
    defaultAbiCoder.encode(
      ["bytes32", "bytes32", "bytes32", "uint256", "address"],
      [
        keccak256(
          toUtf8Bytes(
            "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
          )
        ),
        keccak256(toUtf8Bytes(name)),
        keccak256(toUtf8Bytes(version)),
        parseInt(chainId),
        contractAddress.toLowerCase()
      ]
    )
  );
};

// Returns the EIP712 hash which should be signed by the user
// in order to make a call to `permit`
const getPermitDigest = (
  name,
  address,
  chainId,
  version,
  owner,
  spender,
  value,
  nonce,
  deadline
) => {
  const DOMAIN_SEPARATOR = getDomainSeparator(name, address, chainId, version);
  return keccak256(
    pack(
      ["bytes1", "bytes1", "bytes32", "bytes32"],
      [
        "0x19",
        "0x01",
        DOMAIN_SEPARATOR,
        keccak256(
          defaultAbiCoder.encode(
            ["bytes32", "address", "address", "uint256", "uint256", "uint256"],
            [PERMIT_TYPEHASH, owner, spender, value, nonce, deadline]
          )
        )
      ]
    )
  );
};

contract("ARTHValuecoin", async accounts => {
  const [owner, alice, bob, carol, dennis, fund] = accounts;

  const [bountyAddress, lpRewardsAddress, multisig] = accounts.slice(997, 1000);

  // the second account our hardhatenv creates (for Alice)
  // from https://github.com/liquity/dev/blob/main/packages/contracts/hardhatAccountsList2k.js#L3
  const alicePrivateKey = "0xeaa445c85f7b438dEd6e831d06a4eD0CEBDc2f8527f84Fcda6EBB5fCfAd4C0e9";

  let chainId;
  let arthTokenOriginal;
  let arthTokenTester;
  let stabilityPool;
  let troveManager;
  let borrowerOperations;

  let tokenName;
  let tokenVersion;

  const testCorpus = ({ withProxy = false }) => {
    beforeEach(async () => {
      const contracts = await deploymentHelper.deployTesterContractsHardhat(owner, fund);
      await deploymentHelper.connectCoreContracts(contracts);

      arthTokenOriginal = contracts.arthToken;
      arthTokenTester = contracts.arthToken;
      // for some reason this doesn’t work with coverage network
      //chainId = await web3.eth.getChainId()
      chainId = await arthTokenOriginal.getChainId();

      stabilityPool = contracts.stabilityPool;
      troveManager = contracts.stabilityPool;
      borrowerOperations = contracts.borrowerOperations;

      tokenVersion = await arthTokenOriginal.version();
      tokenName = await arthTokenOriginal.name();

      await arthTokenOriginal.unprotectedMint(alice, 150);
      await arthTokenOriginal.unprotectedMint(bob, 100);
      await arthTokenOriginal.unprotectedMint(carol, 50);
    });

    it("balanceOf(): gets the balance of the account", async () => {
      const aliceBalance = (await arthTokenTester.balanceOf(alice)).toNumber();
      const bobBalance = (await arthTokenTester.balanceOf(bob)).toNumber();
      const carolBalance = (await arthTokenTester.balanceOf(carol)).toNumber();

      assert.equal(aliceBalance, 150);
      assert.equal(bobBalance, 100);
      assert.equal(carolBalance, 50);
    });

    it("totalSupply(): gets the total supply", async () => {
      const total = (await arthTokenTester.totalSupply()).toString();
      assert.equal(total, "300"); // 300
    });

    it("name(): returns the token's name", async () => {
      const name = await arthTokenTester.name();
      assert.equal(name, "ARTH Valuecoin");
    });

    it("symbol(): returns the token's symbol", async () => {
      const symbol = await arthTokenTester.symbol();
      assert.equal(symbol, "ARTH");
    });

    it("decimal(): returns the number of decimal digits used", async () => {
      const decimals = await arthTokenTester.decimals();
      assert.equal(decimals, "18");
    });

    it("allowance(): returns an account's spending allowance for another account's balance", async () => {
      await arthTokenTester.approve(alice, 100, { from: bob });

      const allowance_A = await arthTokenTester.allowance(bob, alice);
      const allowance_D = await arthTokenTester.allowance(bob, dennis);

      assert.equal(allowance_A, 100);
      assert.equal(allowance_D, "0");
    });

    it("approve(): approves an account to spend the specified amount", async () => {
      const allowance_A_before = await arthTokenTester.allowance(bob, alice);
      assert.equal(allowance_A_before, "0");

      await arthTokenTester.approve(alice, 100, { from: bob });

      const allowance_A_after = await arthTokenTester.allowance(bob, alice);
      assert.equal(allowance_A_after, 100);
    });

    if (!withProxy) {
      it("approve(): reverts when spender param is address(0)", async () => {
        const txPromise = arthTokenTester.approve(ZERO_ADDRESS, 100, { from: bob });
        await assertRevert(txPromise);
      });

      it("approve(): reverts when owner param is address(0)", async () => {
        const txPromise = arthTokenTester.callInternalApprove(ZERO_ADDRESS, alice, dec(1000, 18), {
          from: bob
        });
        await assertRevert(txPromise);
      });
    }

    it("transferFrom(): successfully transfers from an account which is it approved to transfer from", async () => {
      const allowance_A_0 = await arthTokenTester.allowance(bob, alice);
      assert.equal(allowance_A_0, "0");

      await arthTokenTester.approve(alice, 50, { from: bob });

      // Check A's allowance of Bob's funds has increased
      const allowance_A_1 = await arthTokenTester.allowance(bob, alice);
      assert.equal(allowance_A_1, 50);

      assert.equal(await arthTokenTester.balanceOf(carol), 50);

      // Alice transfers from bob to Carol, using up her allowance
      await arthTokenTester.transferFrom(bob, carol, 50, { from: alice });
      assert.equal(await arthTokenTester.balanceOf(carol), 100);

      // Check A's allowance of Bob's funds has decreased
      const allowance_A_2 = await arthTokenTester.allowance(bob, alice);
      assert.equal(allowance_A_2, "0");

      // Check bob's balance has decreased
      assert.equal(await arthTokenTester.balanceOf(bob), 50);

      // Alice tries to transfer more tokens from bob's account to carol than she's allowed
      const txPromise = arthTokenTester.transferFrom(bob, carol, 50, { from: alice });
      await assertRevert(txPromise);
    });

    it("transfer(): increases the recipient's balance by the correct amount", async () => {
      assert.equal(await arthTokenTester.balanceOf(alice), 150);

      await arthTokenTester.transfer(alice, 37, { from: bob });

      assert.equal(await arthTokenTester.balanceOf(alice), 187);
    });

    it("transfer(): reverts if amount exceeds sender's balance", async () => {
      assert.equal(await arthTokenTester.balanceOf(bob), 100);

      const txPromise = arthTokenTester.transfer(alice, 101, { from: bob });
      await assertRevert(txPromise);
    });

    it("transfer(): transferring to a blacklisted address reverts", async () => {
      await assertRevert(arthTokenTester.transfer(arthTokenTester.address, 1, { from: alice }));
      await assertRevert(arthTokenTester.transfer(ZERO_ADDRESS, 1, { from: alice }));
      await assertRevert(arthTokenTester.transfer(troveManager.address, 1, { from: alice }));
      await assertRevert(arthTokenTester.transfer(stabilityPool.address, 1, { from: alice }));
      // await assertRevert(arthTokenTester.transfer(borrowerOperations.address, 1, { from: alice }));
    });

    it("increaseAllowance(): increases an account's allowance by the correct amount", async () => {
      const allowance_A_Before = await arthTokenTester.allowance(bob, alice);
      assert.equal(allowance_A_Before, "0");

      await arthTokenTester.increaseAllowance(alice, 100, { from: bob });

      const allowance_A_After = await arthTokenTester.allowance(bob, alice);
      assert.equal(allowance_A_After, 100);
    });

    if (!withProxy) {
      it("mint(): issues correct amount of tokens to the given address", async () => {
        const alice_balanceBefore = await arthTokenTester.balanceOf(alice);
        assert.equal(alice_balanceBefore, 150);

        await arthTokenTester.unprotectedMint(alice, 100);

        const alice_BalanceAfter = await arthTokenTester.balanceOf(alice);
        assert.equal(alice_BalanceAfter, 250);
      });

      it("burn(): burns correct amount of tokens from the given address", async () => {
        const alice_balanceBefore = await arthTokenTester.balanceOf(alice);
        assert.equal(alice_balanceBefore, 150);

        await arthTokenTester.unprotectedBurn(alice, 70);

        const alice_BalanceAfter = await arthTokenTester.balanceOf(alice);
        assert.equal(alice_BalanceAfter, 80);
      });

      // TODO: Rewrite this test - it should check the actual arthTokenTester's balance.
      it("sendToPool(): changes balances of Stability pool and user by the correct amounts", async () => {
        const stabilityPool_BalanceBefore = await arthTokenTester.balanceOf(stabilityPool.address);
        const bob_BalanceBefore = await arthTokenTester.balanceOf(bob);
        assert.equal(stabilityPool_BalanceBefore, 0);
        assert.equal(bob_BalanceBefore, 100);

        await arthTokenTester.unprotectedSendToPool(bob, stabilityPool.address, 75);

        const stabilityPool_BalanceAfter = await arthTokenTester.balanceOf(stabilityPool.address);
        const bob_BalanceAfter = await arthTokenTester.balanceOf(bob);
        assert.equal(stabilityPool_BalanceAfter, 75);
        assert.equal(bob_BalanceAfter, 25);
      });

      it("returnFromPool(): changes balances of Stability pool and user by the correct amounts", async () => {
        /// --- SETUP --- give pool 100 ARTH
        await arthTokenTester.unprotectedMint(stabilityPool.address, 100);

        /// --- TEST ---
        const stabilityPool_BalanceBefore = await arthTokenTester.balanceOf(stabilityPool.address);
        const bob_BalanceBefore = await arthTokenTester.balanceOf(bob);
        assert.equal(stabilityPool_BalanceBefore, 100);
        assert.equal(bob_BalanceBefore, 100);

        await arthTokenTester.unprotectedReturnFromPool(stabilityPool.address, bob, 75);

        const stabilityPool_BalanceAfter = await arthTokenTester.balanceOf(stabilityPool.address);
        const bob_BalanceAfter = await arthTokenTester.balanceOf(bob);
        assert.equal(stabilityPool_BalanceAfter, 25);
        assert.equal(bob_BalanceAfter, 175);
      });
    }

    it("transfer(): transferring to a blacklisted address reverts", async () => {
      await assertRevert(arthTokenTester.transfer(arthTokenTester.address, 1, { from: alice }));
      await assertRevert(arthTokenTester.transfer(ZERO_ADDRESS, 1, { from: alice }));
      await assertRevert(arthTokenTester.transfer(troveManager.address, 1, { from: alice }));
      await assertRevert(arthTokenTester.transfer(stabilityPool.address, 1, { from: alice }));
      // await assertRevert(arthTokenTester.transfer(borrowerOperations.address, 1, { from: alice }));
    });

    it("decreaseAllowance(): decreases allowance by the expected amount", async () => {
      await arthTokenTester.approve(bob, dec(3, 18), { from: alice });
      assert.equal((await arthTokenTester.allowance(alice, bob)).toString(), dec(3, 18));
      await arthTokenTester.decreaseAllowance(bob, dec(1, 18), { from: alice });
      assert.equal((await arthTokenTester.allowance(alice, bob)).toString(), dec(2, 18));
    });

    it("decreaseAllowance(): fails trying to decrease more than previously allowed", async () => {
      await arthTokenTester.approve(bob, dec(3, 18), { from: alice });
      assert.equal((await arthTokenTester.allowance(alice, bob)).toString(), dec(3, 18));
      await assertRevert(
        arthTokenTester.decreaseAllowance(bob, dec(4, 18), { from: alice }),
        "ERC20: decreased allowance below zero"
      );
      assert.equal((await arthTokenTester.allowance(alice, bob)).toString(), dec(3, 18));
    });

    // EIP2612 tests

    if (!withProxy) {
      it("version(): returns the token contract's version", async () => {
        const version = await arthTokenTester.version();
        assert.equal(version, "3");
      });

      it("Initializes PERMIT_TYPEHASH correctly", async () => {
        assert.equal(await arthTokenTester.permitTypeHash(), PERMIT_TYPEHASH);
      });

      it("Initializes DOMAIN_SEPARATOR correctly", async () => {
        assert.equal(
          await arthTokenTester.domainSeparator(),
          getDomainSeparator(tokenName, arthTokenTester.address, chainId, tokenVersion)
        );
      });

      it("Initial nonce for a given address is 0", async function () {
        assert.equal(toBN(await arthTokenTester.nonces(alice)).toString(), "0");
      });

      // Create the approval tx data
      const approve = {
        owner: alice,
        spender: bob,
        value: 1
      };

      const buildPermitTx = async deadline => {
        const nonce = (await arthTokenTester.nonces(approve.owner)).toString();

        // Get the EIP712 digest
        const digest = getPermitDigest(
          tokenName,
          arthTokenTester.address,
          chainId,
          tokenVersion,
          approve.owner,
          approve.spender,
          approve.value,
          nonce,
          deadline
        );

        const { v, r, s } = sign(digest, alicePrivateKey);

        const tx = arthTokenTester.permit(
          approve.owner,
          approve.spender,
          approve.value,
          deadline,
          v,
          hexlify(r),
          hexlify(s)
        );

        return { v, r, s, tx };
      };

      it("permits and emits an Approval event (replay protected)", async () => {
        const deadline = 100000000000000;

        // Approve it
        const { v, r, s, tx } = await buildPermitTx(deadline);
        const receipt = await tx;
        const event = receipt.logs[0];

        // Check that approval was successful
        assert.equal(event.event, "Approval");
        assert.equal(await arthTokenTester.nonces(approve.owner), 1);
        assert.equal(await arthTokenTester.allowance(approve.owner, approve.spender), approve.value);

        // Check that we can not use re-use the same signature, since the user's nonce has been incremented (replay protection)
        await assertRevert(
          arthTokenTester.permit(approve.owner, approve.spender, approve.value, deadline, v, r, s),
          "ARTH: invalid signature"
        );

        // Check that the zero address fails
        await assertRevert(
          arthTokenTester.permit(
            "0x0000000000000000000000000000000000000000",
            approve.spender,
            approve.value,
            deadline,
            "0x99",
            r,
            s
          )
        );
      });

      it("permits(): fails with expired deadline", async () => {
        const deadline = 1;

        const { v, r, s, tx } = await buildPermitTx(deadline);
        await assertRevert(tx, "ARTH: expired deadline");
      });

      it("permits(): fails with the wrong signature", async () => {
        const deadline = 100000000000000;

        const { v, r, s } = await buildPermitTx(deadline);

        const tx = arthTokenTester.permit(
          carol,
          approve.spender,
          approve.value,
          deadline,
          v,
          hexlify(r),
          hexlify(s)
        );

        await assertRevert(tx, "ARTH: invalid signature");
      });
    }
  };
  describe("Basic token functions, without Proxy", async () => {
    testCorpus({ withProxy: false });
  });

  describe("Basic token functions, with Proxy", async () => {
    testCorpus({ withProxy: true });
  });
});

contract("Reset chain state", async accounts => {});
