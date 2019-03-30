import { put, takeLatest, call } from 'redux-saga/effects'

import {
  FETCH_BADGES_CACHE,
  cacheBadges,
  fetchBadgesFailed
} from '../actions/badges'
import {
  contractStatusToClientStatus,
  instantiateEnvObjects
} from '../utils/tcr'
import { APP_VERSION } from '../bootstrap/dapp-api'

const fetchEvents = async (eventName, fromBlock, contract) =>
  contract.getPastEvents(eventName, { fromBlock })

/**
 * Fetches a paginable list of badges.
 * @param {{ type: string, payload: ?object, meta: ?object }} action - The action object.
 */
function* fetchBadges() {
  const { arbitrableAddressListView, ETHFINEX_BADGE_BLOCK } = yield call(
    instantiateEnvObjects
  )

  try {
    // Get the lastest status change for every badge.
    let statusBlockNumber = ETHFINEX_BADGE_BLOCK
    const latestStatusChanges = {}
    let badges = localStorage.getItem(
      `${arbitrableAddressListView.options.address}badges@${APP_VERSION}`
    )
    if (!badges)
      badges = {
        statusBlockNumber: ETHFINEX_BADGE_BLOCK,
        items: {},
        addressToIDs: {}
      }
    else {
      badges = JSON.parse(badges)
      yield put(cacheBadges(badges))
      badges = JSON.parse(JSON.stringify(badges)) // Get a deep copy.
    }

    const statusChanges = yield call(
      fetchEvents,
      'AddressStatusChange',
      badges.statusBlockNumber,
      arbitrableAddressListView
    )

    statusChanges.forEach(event => {
      const { returnValues } = event
      const { _address } = returnValues
      if (event.blockNumber > statusBlockNumber)
        statusBlockNumber = event.blockNumber

      if (!latestStatusChanges[_address]) {
        latestStatusChanges[_address] = event
        return
      }
      if (event.blockNumber > latestStatusChanges[_address].blockNumber)
        latestStatusChanges[_address] = event
    })

    const statusEvents = Object.keys(latestStatusChanges).map(
      address => latestStatusChanges[address]
    )

    const cachedBadges = {
      items: {
        ...badges.items
      },
      statusBlockNumber
    }

    statusEvents.forEach(event => {
      const { returnValues, blockNumber } = event
      const {
        _address,
        _status,
        _disputed,
        _requester,
        _challenger
      } = returnValues
      cachedBadges.items[_address] = {
        address: _address,
        blockNumber,
        status: {
          status: Number(_status),
          disputed: _disputed,
          requester: _requester,
          challenger: _challenger
        }
      }
    })

    Object.keys(cachedBadges.items).forEach(address => {
      cachedBadges.items[address].clientStatus = contractStatusToClientStatus(
        cachedBadges.items[address].status.status,
        cachedBadges.items[address].status.disputed
      )
    })

    localStorage.setItem(
      `${arbitrableAddressListView.options.address}badges@${APP_VERSION}`,
      JSON.stringify(cachedBadges)
    )

    yield put(cacheBadges(cachedBadges))
  } catch (err) {
    if (err.message === 'Returned error: request failed or timed out')
      // This is a web3js bug. https://github.com/ethereum/web3.js/issues/2311
      // We can't upgrade to version 37 as suggested because we hit bug https://github.com/ethereum/web3.js/issues/1802.
      // Work around it by just trying again.
      yield put({ type: FETCH_BADGES_CACHE })
    else {
      console.error('Error fetching badges ', err)
      yield put(fetchBadgesFailed())
    }
  }
}

/**
 * The root of the badges saga.
 */
export default function* actionWatcher() {
  yield takeLatest(FETCH_BADGES_CACHE, fetchBadges)
}
