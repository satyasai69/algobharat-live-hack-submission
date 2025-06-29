import logging

import algokit_utils
from algosdk.v2client.algod import AlgodClient
from algosdk.v2client.indexer import IndexerClient

logger = logging.getLogger(__name__)


# define deployment behaviour based on supplied app spec
def deploy(
    algod_client: AlgodClient,
    indexer_client: IndexerClient,
    app_spec: algokit_utils.ApplicationSpecification,
    deployer: algokit_utils.Account,
) -> None:
    from smart_contracts.artifacts.adv_marketplace.adv_marketplace_client import (
        AdvMarketplaceClient,
    )

    app_client = AdvMarketplaceClient(
        algod_client,
        creator=deployer,
        indexer_client=indexer_client,
    )

    app_client.deploy(
        on_schema_break=algokit_utils.OnSchemaBreak.AppendApp,
        on_update=algokit_utils.OnUpdate.AppendApp,
    )
    # name = "world"
    # response = app_client.hello(name=name)
    logger.info(
        f"Called hello on {app_spec.contract.name} ({app_client.app_id}) "
       # f"with name={name}, received: {response.return_value}"
    )