from algopy import (
    Account,
    Bytes,
    Contract,
    LocalState,
    String,
    UInt64,
    subroutine,
)
from algopy.op import btoi


class LocalStateContract(Contract):
    def __init__(self) -> None:
        self.local = LocalState(Bytes) # no_default
        self.balance = LocalState(UInt64);
        self.local_bool = LocalState(bool) # no_default

    #0x11 -> value (balance)
    @subroutine
    def set_data(self, for_account: Account, value: UInt64) -> None:
        self.balance[for_account] = value

    @subroutine
    def get_guaranteed_data(self, for_account: Account) -> Bytes:
        result = self.local[for_account]
        # this just tests local state proxy can be passed around
        assert result.length == get_local_state_length(self.local, for_account)
        # tests for dynamic key
        assert local_bytes_exists(for_account, Bytes(b"local"))
        assert read_local_bytes(for_account, String("local")) == result
        return result

    @subroutine
    def get_data_with_default(self, for_account: Account, default: Bytes) -> Bytes:
        return self.local.get(for_account, default)

    @subroutine
    def get_data_or_assert(self, for_account: Account) -> UInt64:
        result, exists = self.local.maybe(for_account)
        assert exists, "no data for account"
        return btoi(result)


    @subroutine
    def delete_data(self, for_account: Account) -> None:
        del self.local[for_account]


@subroutine
def get_local_state_length(state: LocalState[Bytes], account: Account) -> UInt64:
    return state[account].length


@subroutine
def local_bytes_exists(account: Account, key: Bytes) -> bool:
    return account in LocalState(Bytes, key=key)


@subroutine
def read_local_bytes(account: Account, key: String) -> Bytes:
    return LocalState(Bytes, key=key)[account]
