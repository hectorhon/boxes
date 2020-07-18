const chai = require('chai')
// const chaiThings = require('chai-things')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const uuid = require('uuid')

// chai.use(chaiThings)
chai.use(sinonChai)
const expect = chai.expect
const MemoryGame = require('../../../games/memory/core')

function getPlayerSelectedCardIds(game, playerId) {
  const player = game.players.find(player => player.id === playerId)
  return player.selectedCards.map(card => card.id)
}

describe('Memory game core', () => {

  describe('#constructor()', () => {
    let game
    const numPairs = 5

    before(() => {
      game = new MemoryGame({ numPairs })
    })

    it('should create correct number of cards', () => {
      expect(game.cards).to.have.lengthOf(numPairs * 2)
    })

    it('should create correct pairs of cards', () => {
      const valuesCount = {}
      game.cards.forEach(card => {
        if (!valuesCount[card.value]) {
          valuesCount[card.value] = 1
        } else {
          valuesCount[card.value] += 1
        }
      })
      expect(Object.keys(valuesCount)).to.have.lengthOf(numPairs)
      for (let value in valuesCount) {
        expect(valuesCount[value]).to.equal(2)
      }
    })

    it('should shuffle the cards')
  })

  describe('#addPlayer()', () => {
    let game, emit
    const playerId = uuid.v4()
    const playerNickname = 'james'

    beforeEach(() => {
      game = new MemoryGame({ numPairs: 5 })
      emit = sinon.spy(game, 'emit')
      game.addPlayer(playerId, playerNickname)
    })

    it('should add player', () => {
      expect(game.players.map(player => player.id)).to.include(playerId)
    })

    it('should emit playerJoined event', () => {
      expect(emit).to.have.been.calledWith('playerJoined', {
        id: playerId,
        nickname: playerNickname,
      })
    })

    it("should initialize player connection state to 'connected'", () => {
      const player = game.players.find(player => player.id === playerId)
      expect(player).to.have.property('connectionState', 'connected')
    })

    describe('player has been added and still connected', () => {
      it('should not add player', () => {
        const originalGamePlayersCount = game.players.length
        game.addPlayer(playerId, playerNickname)
        expect(game.players).to.have.lengthOf(originalGamePlayersCount)
        expect(emit).to.have.been.calledOnceWith('playerJoined')
      })

      it('should call provided callback', () => {
        const callbackIfExistingConnectedPlayer = sinon.stub()
        game.addPlayer(playerId, playerNickname, callbackIfExistingConnectedPlayer)
        expect(callbackIfExistingConnectedPlayer).to.have.been.calledOnce
      })
    })

    describe('player has been added but no longer connected', () => {
      it('should emit playerReconnected event')
    })
  })

  describe('#removePlayer()', () => {
    it("should set player connection state to 'disconnected'")

    it('should emit playerDisconnected event')
  })

  describe('#tryPlayerSelectCard()', () => {
    let game, emit, randomCardIndex, randomCard
    const player1Id = uuid.v4()
    const player1Nickname = 'james'
    const player2Id = uuid.v4()
    const player2Nickname = 'bill'

    beforeEach(() => {
      game = new MemoryGame({ numPairs: 5 })
      emit = sinon.spy(game, 'emit')
      game.addPlayer(player1Id, player1Nickname)
      game.addPlayer(player2Id, player2Nickname)
      randomCardIndex = Math.floor(Math.random() * game.cards.length)
      randomCard = game.cards[randomCardIndex]
    })

    describe('card has already been matched', () => {
      beforeEach(() => {
        card1a = game.cards[0]
        card1b = game.cards.find((card, index) => card.value === card1a.value && index != 0)
        game.tryPlayerSelectCard(player1Id, card1a.id)
        game.tryPlayerSelectCard(player1Id, card1b.id)
        game.tryPlayerSelectCard(player1Id, card1a.id)
      })

      it('should fail to select the card', () => {
        expect(getPlayerSelectedCardIds(game, player1Id)).to.not.include(card1a.id)
        expect(getPlayerSelectedCardIds(game, player1Id)).to.not.include(card1b.id)
      })

      it('should emit playerSelectCardFailed event', () => {
        expect(emit).to.have.been.calledWith('playerSelectCardFailed', {
          playerId: player1Id,
          cardId: card1a.id,
        })
      })
    })

    describe("card isn't selected by anyone else", () => {
      beforeEach(() => {
        game.tryPlayerSelectCard(player1Id, randomCard.id)
      })

      it('should select the card', () => {
        expect(getPlayerSelectedCardIds(game, player1Id)).to.include(randomCard.id)
      })

      it('should emit playerSelectedCard event', () => {
        expect(emit).to.have.been.calledWith('playerSelectedCard', {
          playerId: player1Id,
          cardId: randomCard.id,
          cardValue: randomCard.value,
        })
      })
    })

    describe('card is selected by someone else', () => {
      beforeEach(() => {
        game.tryPlayerSelectCard(player1Id, randomCard.id)
        game.tryPlayerSelectCard(player2Id, randomCard.id)
      })

      it('should fail to select the card', () => {
        expect(getPlayerSelectedCardIds(game, player2Id)).to.not.include(randomCard.id)
      })

      it('should emit playerSelectCardFailed event', () => {
        expect(emit).to.have.been.calledWith('playerSelectCardFailed', {
          playerId: player2Id,
          cardId: randomCard.id,
        })
      })
    })

    describe('card is currently selected by same player', () => {
      beforeEach(() => {
        game.tryPlayerSelectCard(player1Id, randomCard.id)
        game.tryPlayerSelectCard(player1Id, randomCard.id)
      })

      it('should deselect the card', () => {
        expect(getPlayerSelectedCardIds(game, player1Id)).to.not.include(randomCard.id)
      })

      it('should emit playerDeselectedCard event', () => {
        expect(emit).to.have.been.calledWith('playerDeselectedCard', {
          playerId: player1Id,
          cardId: randomCard.id,
        })
      })
    })

    it('should trigger checking for matches after player selected 2 cards', () => {
      const checkForMatches = sinon.spy(game, '_checkForMatches')
      game.tryPlayerSelectCard(player1Id, randomCard.id)
      expect(checkForMatches).to.not.have.been.called
      const randomCardIndex2 = (randomCardIndex + 1) % game.cards.length
      const randomCard2 = game.cards[randomCardIndex2]
      game.tryPlayerSelectCard(player1Id, randomCard2.id)
      const lastCall = checkForMatches.getCall(-1)
      expect(lastCall.args[0]).to.have.property('id', player1Id)
    })
  })

  describe('#_checkForMatches()', () => {
    let game, emit, card1a, card1b
    const player1Id = uuid.v4()
    const player1Nickname = 'james'

    beforeEach(() => {
      game = new MemoryGame({ numPairs: 5 })
      card1a = game.cards[0]
      card1b = game.cards.find((card, index) => card.value === card1a.value && index != 0)
      card2 = game.cards.find(card => card.value !== card1a.value)
      emit = sinon.spy(game, 'emit')
      game.addPlayer(player1Id, player1Nickname)
    })

    describe('match is present', () => {
      beforeEach(() => {
        game.tryPlayerSelectCard(player1Id, card1a.id)
        game.tryPlayerSelectCard(player1Id, card1b.id)
      })

      it('should mark the cards as matched', () => {
        expect(card1a).to.have.property('isMatched', true)
        expect(card1b).to.have.property('isMatched', true)
        expect(card2.isMatched).to.not.be.ok
      })

      it('should emit matchFound event', () => {
        expect(emit).to.have.been.calledWith('matchFound', {
          playerId: player1Id,
          cardIds: [card1a.id, card1b.id],
          cardValue: card1a.value,
        })
      })

      it('should clear player selection', () => {
        const playerSelectedCardIds = getPlayerSelectedCardIds(game, player1Id)
        expect(playerSelectedCardIds).to.be.empty
        expect(card1a.selectedBy).to.not.be.ok
        expect(card1b.selectedBy).to.not.be.ok
      })
    })

    describe('match is not present', () => {
      beforeEach(() => {
        game.tryPlayerSelectCard(player1Id, card1a.id)
        game.tryPlayerSelectCard(player1Id, card2.id)
      })

      it('should not mark the cards as matched', () => {
        expect(card1a.isMatched).to.not.be.ok
        expect(card1b.isMatched).to.not.be.ok
        expect(card2.isMatched).to.not.be.ok
      })

      it('should not emit matchFound event', () => {
        expect(emit).to.not.have.been.calledWith('matchFound')
      })

      it('should not clear player selection', () => {
        const playerSelectedCardIds = getPlayerSelectedCardIds(game, player1Id)
        expect(playerSelectedCardIds).have.lengthOf(2)
      })
    })
  })

  describe('#getStateForPlayer()', () => {
    let game, card1a, card1b, card2a, card2b, card3, card4
    const player1Id = uuid.v4()
    const player1Nickname = 'james'
    const player2Id = uuid.v4()
    const player2Nickname = 'bill'

    before(() => {
      game = new MemoryGame({ numPairs: 5 })
      const uniqueValues = [...new Set(game.cards.map(card => card.value))];
      [card1a, card1b] = game.cards.filter(card => card.value === uniqueValues[0]);
      [card2a, card2b] = game.cards.filter(card => card.value === uniqueValues[1]);
      [card3, _] = game.cards.filter(card => card.value === uniqueValues[2]);
      [card4, _] = game.cards.filter(card => card.value === uniqueValues[3]);
      game.addPlayer(player1Id, player1Nickname)
      game.addPlayer(player2Id, player2Nickname)
      game.tryPlayerSelectCard(player1Id, card1a.id)
      game.tryPlayerSelectCard(player1Id, card1b.id)
      game.tryPlayerSelectCard(player2Id, card2a.id)
      game.tryPlayerSelectCard(player2Id, card2b.id)
      game.tryPlayerSelectCard(player1Id, card3.id)
      game.tryPlayerSelectCard(player2Id, card4.id)
    })

    it('should return values of only cards selected by the player, not other players', () => {
      const player1State = game.getStateForPlayer(player1Id)
      expect(player1State.cards.find(card => card.id === card3.id).value).to.be.a('number')
      expect(player1State.cards.find(card => card.id === card4.id).value).to.not.be.ok

      const player2State = game.getStateForPlayer(player2Id)
      expect(player2State.cards.find(card => card.id === card4.id).value).to.be.a('number')
      expect(player2State.cards.find(card => card.id === card3.id).value).to.not.be.ok
    })

    it('should return values of all matched cards', () => {
      const player1State = game.getStateForPlayer(player1Id);
      [card1a.id, card1b.id, card2a.id, card2b.id].forEach(matchedCardId => {
        expect(player1State.cards.find(card => card.id === matchedCardId).value).to.be.a('number')
      })
    })

    it('should return id of player that selected the card (if any) for every card', () => {
      const player1State = game.getStateForPlayer(player1Id)
      player1State.cards.forEach(card => {
        if (card.id === card3.id) {
          expect(card.selectedBy).to.equal(player1Id)
        } else if (card.id === card4.id) {
          expect(card.selectedBy).to.equal(player2Id)
        } else {
          expect(card.selectedBy).to.not.be.ok
        }
      })
    })

    it('should return list of card ids selected by all players', () => {
      const player1State = game.getStateForPlayer(player1Id)
      player1State.players.forEach(player => {
        if (player.id === player1Id) {
          expect(player.selectedCards).to.deep.equal([card3.id])
        } else if (player.id === player2Id) {
          expect(player.selectedCards).to.deep.equal([card4.id])
        }
      })
    })
  })
})
