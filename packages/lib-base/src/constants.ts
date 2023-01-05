import { Signer } from '@ethersproject/abstract-signer';
import { Decimal } from "./Decimal";
import { Contract, ContractInterface } from "@ethersproject/contracts";
import { BigNumber } from "@ethersproject/bignumber";
import { Provider } from '@ethersproject/abstract-provider'

/**
 * Total collateral ratio below which recovery mode is triggered.
 *
 * @public
 */
export const CRITICAL_COLLATERAL_RATIO = Decimal.from(1.5);

/**
 * Collateral ratio below which a Trove can be liquidated in normal mode.
 *
 * @public
 */
export const MINIMUM_COLLATERAL_RATIO = Decimal.from(1.1);

/**
 * Amount of ARTH that's reserved for compensating the liquidator of a Trove.
 *
 * @public
 */
export const ARTH_LIQUIDATION_RESERVE = Decimal.from(50);

/**
 * A Trove must always have at least this much debt on top of the
 * {@link ARTH_LIQUIDATION_RESERVE | liquidation reserve}.
 *
 * @remarks
 * Any transaction that would result in a Trove with less net debt than this will be reverted.
 *
 * @public
 */
export const ARTH_MINIMUM_NET_DEBT = Decimal.from(250);

/**
 * A Trove must always have at least this much debt.
 *
 * @remarks
 * Any transaction that would result in a Trove with less debt than this will be reverted.
 *
 * @public
 */
export const ARTH_MINIMUM_DEBT = ARTH_LIQUIDATION_RESERVE.add(ARTH_MINIMUM_NET_DEBT);

// /**
//  * Value that the {@link Fees.borrowingRate | borrowing rate} will never decay below.
//  *
//  * @remarks
//  * Note that the borrowing rate can still be lower than this during recovery mode, when it's
//  * overridden by zero.
//  *
//  * @public
//  */
// export const MINIMUM_BORROWING_RATE = Decimal.from(0.005); // getBorrowingFeeFloor

// /**
//  * Value that the {@link Fees.borrowingRate | borrowing rate} will never exceed.
//  *
//  * @public
//  */
// export const MAXIMUM_BORROWING_RATE = Decimal.from(0.05); // getMaxBorrowingFee

// /**
//  * Value that the {@link Fees.redemptionRate | redemption rate} will never decay below.
//  *
//  * @public
//  */
// export const MINIMUM_REDEMPTION_RATE = Decimal.from(0.005); // getRedemptionFeeFloor

export class BorrowingRate {

    private static ABI:ContractInterface = [
        {
            "inputs": [],
            "name": "getBorrowingFeeFloor",
            "outputs": [
              {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "getMaxBorrowingFee",
            "outputs": [
              {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "getRedemptionFeeFloor",
            "outputs": [
              {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
    ]

    static async minBorrowingRate(governance: string, provider: Provider | Signer ): Promise<Decimal> {
        const governanceContract = new Contract(governance, this.ABI, provider)
        const rate: BigNumber = await governanceContract.getBorrowingFeeFloor();
        return Decimal.fromBigNumberString(rate.toString())
    }

    static async maxBorrowingRate(governance: string, provider: Provider | Signer): Promise<Decimal> {
        
        const governanceContract = new Contract(governance, this.ABI, provider)
        const rate: BigNumber = await governanceContract.getMaxBorrowingFee();
        return Decimal.fromBigNumberString(rate.toString())
    }

    static async minRedemptionRate(governance: string, provider: Provider | Signer): Promise<Decimal> {
        
        const governanceContract = new Contract(governance, this.ABI, provider)
        const rate: BigNumber = await governanceContract.getRedemptionFeeFloor();
        return Decimal.fromBigNumberString(rate.toString())
    }
}
