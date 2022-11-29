App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {
    debugger;
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Election.json', function(election){
      App.contracts.Election = TruffleContract(election);
      App.contracts.Election.setProvider(App.web3Provider);

      App.listenForEvents();
      
      return App.render();
    });

    
  },

  listenForEvents: async function() {
    var electionInstance = await App.contracts.Election.deployed();
    electionInstance.votedEvent({}, {
      fromBlock: 0,
      toBlock: 'latest'
    }).watch(function(error, event){
      console.log("Event triggered", event);
      App.render();
    })
  },

  render: async function() {
    var electionInstance;
    var loader = $('#loader');
    var content = $('#content');

    loader.show();
    content.hide();

    web3.eth.getCoinbase(function(err, account){
      debugger;
      if (err === null) {
        App.account = account;
        $('#accountAddress').html("Your Account: " + account);
      }
    });

    var electionInstance = await App.contracts.Election.deployed();
    var candidatesCount = await electionInstance.candidatesCount();

    var candidatesResults = $('#candidatesResults');
    candidatesResults.empty();

    var candidatesSelect = $('#candidatesSelect');
    candidatesSelect.empty();

    for (var i = 1; i <= candidatesCount; i++) {
      var candidate = await electionInstance.candidates(i);

      var id = candidate[0].toNumber();
      var name = candidate[1];
      var voteCount = candidate[2].toNumber();

      var candidateTemplate = `<tr><th>${id}</th><td>${name}</td><td>${voteCount}</td></tr>`;
      candidatesResults.append(candidateTemplate);

      var candidatesSelectTemplate = `<option value="${id}">${name}</option>`;
      candidatesSelect.append(candidatesSelectTemplate);
    }

    var voters = await electionInstance.voters(App.account);

    if (voters) {
      $('form').hide();
    }

    loader.hide();
    content.show();
  },

  

  castVote: async function() {
    var candidate1 = $('candidatesSelect').val();

    var electionInstance = await App.contracts.Election.deployed();
    try {
      await electionInstance.vote(1, { from: App.account });
    } catch(error) {
      console.error(error);
    }
    
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markAdopted: function() {
    /*
     * Replace me...
     */
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    /*
     * Replace me...
     */
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
