import { GlobalState, LocalState, Contract, uint64, bytes, Uint64, contract ,BoxMap,assert} from '@algorandfoundation/algorand-typescript'
import { itxn } from '@algorandfoundation/algorand-typescript';
import {Address} from "@algorandfoundation/algorand-typescript/arc4"
import { Txn } from '@algorandfoundation/algorand-typescript';

const CLAIM_AMOUNT: uint64 = 1_000_000; // 1 token (6 decimals)
const MAX_CLAIMS_PER_USER: uint64 = 5;
const ASSET_ID: uint64 = 0; // Set your asset ID here 


export class TokenClaim extends Contract {
  // Storage for tracking claims
 /* private totalClaimed = GlobalState<uint64>({ key: 'total_claimed' });
  private userClaims = BoxMap<Address, uint64>({ keyPrefix: 'claim_' });
  */

   // Global state for tracking total claims
   private totalClaimed = GlobalState<uint64>({ key: 'total_claimed' });
  
   // Local state for tracking per-user claims (users must opt-in)
   private userClaims = LocalState<uint64>({ key: 'user_claims' });

   // Constants must be defined as `static` or moved into methods
   //private static readonly CLAIM_AMOUNT: uint64 = 1_000_000; // 1 token (6 decimals)
   //private static readonly MAX_CLAIMS_PER_USER: uint64 = 5;
   //private static readonly ASSET_ID: uint64 = 0; // Set your asset ID here 

 
  public hello(name: string): string {
    return `${this.getHello()} ${name}`;
  }

  private getHello(): string {
    return 'Hello';
  }

  /**
   * Allows anyone to claim tokens
   * Each user can claim up to MAX_CLAIMS_PER_USER times
   */
  public claimTokens(): void {
    const claimer = Txn.sender;
    
    // Check if user has already claimed maximum times
    const userClaimCount = this.userClaims(claimer).value;
    assert(userClaimCount < MAX_CLAIMS_PER_USER, 'Maximum claims reached');
   
    

  /*  // Send tokens to claimer using inner transaction
    itxn.submit({
      type: 'axfer',
      assetReceiver: claimer,
      assetAmount: CLAIM_AMOUNT,
      xferAsset: ASSET_ID,
    });  */

    itxn.assetTransfer({
      assetReceiver: claimer,
      assetAmount: CLAIM_AMOUNT,
      xferAsset: ASSET_ID,
    }).submit(); 


    // Update claim tracking
    this.userClaims(claimer).value = userClaimCount + 1;
    this.totalClaimed.value = this.totalClaimed.value + CLAIM_AMOUNT;
  } 

  /**
   * Alternative claim function for Algo instead of ASA
   */
  public claimAlgo(): void {
    const claimer = Txn.sender;
    const userClaimCount = this.userClaims(claimer).value;
    
    assert(userClaimCount < MAX_CLAIMS_PER_USER, 'Maximum claims reached');
    
   // Send Algo using inner transaction
  /*  itxn.submit({
      type: 'pay',
      receiver: claimer,
      amount: CLAIM_AMOUNT,
    }); 
    */
    itxn.payment({
      receiver: claimer,
      amount: CLAIM_AMOUNT,
    }).submit();

    // Update tracking
    this.userClaims(claimer).value = userClaimCount + 1;
    this.totalClaimed.value = this.totalClaimed.value + CLAIM_AMOUNT;
  }

  /**
   * Check how many times a user has claimed
   */
  /*public getUserClaimCount(user: Address): uint64 {
    return this.userClaims(user).value;
  } */

  /**
   * Check total amount claimed by all users
   */
  public getTotalClaimed(): uint64 {
    return this.totalClaimed.value;
  }

  /**
   * Check if a user can still claim
   */
  /*public canUserClaim(user: Address): boolean {
    return this.userClaims(user).value < this.MAX_CLAIMS_PER_USER;
  } */

  /**
   * Admin function to fund the contract (optional)
   */
  public fundContract(): void {
    // This method can be called to receive tokens/algo
    // The actual funding happens through the transaction that calls this method
  }
}