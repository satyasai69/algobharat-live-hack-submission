from collections.abc import Generator
from algopy import Bytes, UInt64, arc4
import algopy
import pytest
from algopy_testing import AlgopyTestContext, algopy_testing_context

from smart_contracts.adv_marketplace.contract import AdvMarketplace

FOR_SALE_BOX_KEY_LENGTH = 48
FOR_SALE_BOX_VALUE_LENGTH = 64
FOR_SALE_BOX_SIZE = FOR_SALE_BOX_KEY_LENGTH + FOR_SALE_BOX_VALUE_LENGTH
FOR_SALE_BOX_MBR = 2_500 + FOR_SALE_BOX_SIZE * 400

@pytest.fixture()
def context() -> Generator[AlgopyTestContext, None, None]:
    with algopy_testing_context() as ctx:
        yield ctx
        ctx.reset()

def test_allow_asset(context: AlgopyTestContext) -> None:
    # mbr_pay, asset
    sender = context.any_account()
    contract = AdvMarketplace()
    contract.__init__()
    #
    context.patch_txn_fields(sender=sender)
    context.patch_global_fields(latest_timestamp=UInt64(1_000))
    asset = context.any_asset(creator=sender, decimals=UInt64(3), total=UInt64(10_000_000))
    app_address = context.default_application.address
    pay_txn = context.any_payment_transaction(receiver=app_address, amount=UInt64(0))

    # Input Payment Txn
    contract.allow_asset(mbr_pay=pay_txn, asset=asset)

    itxn_txn = context.get_submitted_itxn_group(0)
    # Comparing Txn
    # assert len(itxn_txn) > 1

def test_first_deposit(context: AlgopyTestContext) -> None:
    sender = context.any_account()
    contract = AdvMarketplace()
    app_address = context.default_application.address
    context.patch_txn_fields(sender=sender)

    pay_txn = context.any_payment_transaction(receiver=app_address,amount=UInt64(FOR_SALE_BOX_MBR), sender=sender)
    asset = context.any_asset(name=Bytes(b"OPENEDU"),creator=sender, decimals=UInt64(3), total=UInt64(10_000_000))
    xfer_txn = context.any_asset_transfer_transaction(sender=sender, xfer_asset=asset, asset_receiver=app_address, asset_amount=UInt64(100))

    contract.first_deposit(mbr_pay=pay_txn, xfer=xfer_txn, nonce=arc4.UInt64(0), unitary_price=arc4.UInt64(3))

    # assert
    # itxn_txn = context.get_submitted_itxn_group(0)
