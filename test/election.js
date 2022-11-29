var Election = artifacts.require("./Election.sol");

contract("Election", function(accounts){
  
  it("initidalises with two candidates", async function() {
    var app = await Election.deployed();
    var count = await app.candidatesCount();

    assert.equal(count, 2);
  });

  it('initialise the candidates with the correct values', async function(){
    var app = await Election.deployed();
    var candidates = await app.candidates(1);

    assert.equal(candidates.id.toNumber(), 1, "contains the correct id");
    assert.equal(candidates.name, "Candidate 1", "contains the correct name");
    assert.equal(candidates.voteCount.toNumber(), 0, "contains the coorect votes count");
  })

  it('allows a voter to cast a vote', async function() {
    var app = await Election.deployed();
    var candidateId = 1;
    var receipt = await app.vote(candidateId, { from: accounts[1] });

    assert.equal(receipt.logs.length, 1, "an event was triggerd");
    assert.equal(receipt.logs[0].event, 'votedEvent', 'correct event type');
    assert.equal(receipt.logs[0].args._candidateId.toNumber(), candidateId, "correct candidate id");

    var voted = await app.voters(accounts[1]);

    assert(voted, "the voter was marked as voted");

    var candidate = await app.candidates(candidateId);
    var voteCount = candidate[2];

    assert.equal(voteCount, 1, "increments the candidate's vote count");
  });

  it('invalid candidate', async function() {
    var app = await Election.deployed();
    try {
      var receipt = app.vote(99, { from: accounts[1] });
    } catch(error) {
      assert(error.message.indexOf('revert') >= 0, "error must contain revert");
    }   

  });

  it('throws an exeption for double voting', async function() {
    var app = await Election.deployed();
    app.vote(2, { from: accounts[2]});

    try {
      
      app.vote(2, { from: accounts[2]});
    } catch(error) {
      assert(error.message.indexOf('revert') >= 0, "error must contain revert");
    }
    
    
  });

});