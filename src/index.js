require('./index.html?output=index.html');
require('./images/spinner.svg?output=/assets/spinner.svg');
require('./images/favicon.png?output=/assets/favicon.png');
require('./images/web_img.jpg?output=/assets/web_img.jpg');

import VoyagerClient from './voyager_client'
import TopPage from './views/top_page'
import Block from './views/block'
import Transaction from './views/transaction'
import Address from './views/address'

let URI = "wss://voyager.cancoin.co/api/v1/websocket"

{
  let view = {}
  var router = null;

  let DEFAULT_RECONNECT_BACKOFF = 100;
  let reconnect_backoff = DEFAULT_RECONNECT_BACKOFF;

  let vm = {
    last_height: m.prop('000000'),
    socket_connected: m.prop(false),
    socket_error: m.prop(null),
    error: m.prop(null),
    search: m.prop(''),
    searchOpen: m.prop(false)
  };

  let onConnected = (r) => {
    vm.socket_connected(true);
    reconnect_backoff = DEFAULT_RECONNECT_BACKOFF;

    view = {
      top_page: new TopPage(state),
      block: new Block(state),
      transaction: new Transaction(state),
      address: new Address(state)
    }

    client.fetchLastHeight()
      .then((r) => vm.last_height(r.height),
            (r) => vm.error(r))
      .then(route)
  }

  let onError = (event) => {
    vm.socket_connected(false);
    vm.error(event.error);
  }

  let onClosed = (_) => {
    vm.socket_connected(false);
    m.redraw('full')
    reconnect_backoff = Math.min(30 * 1000, reconnect_backoff * 2);
    setTimeout(() => { connectClient(); }, reconnect_backoff)
  }

  let connectClient = () => {
    return new VoyagerClient(URI, onConnected, onError, onClosed);
  }

  let client = connectClient();

  client.onMessage = function(message) {}

  let state = {
    client: client,
    vm: vm
  }

  let route = () => {
    m.route.mode = 'search'
    router = router || m.route(document.getElementById('container'), "/", {
      "/": view.top_page,
      "/block/:hash": view.block,
      "/tx/:hash": view.transaction,
      "/address/:address": view.address
    });
  }
}
