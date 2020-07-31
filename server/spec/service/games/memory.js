const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const uuid = require('uuid')

chai.use(sinonChai)
const expect = chai.expect

const service = require('../../../service/games/memory')

const gameOptions = {
  numPairs: 5
}

describe('Memory game service', () => {
  describe('#createGame()', () => {
    let gameId

    before(() => {
      gameId = service.createGame(gameOptions)
    })

    it('should create a new game', () => {
      const game = service.getGameById(gameId)
      expect(game).to.be.ok
    })

    after(() => {
      service.destroyGame(gameId)
    })
  })

  describe('#destroyGame()', () => {
    let gameId1, gameId2

    before(() => {
      gameId1 = service.createGame(gameOptions)
      gameId2 = service.createGame(gameOptions)
    })

    it('should destroy the game', () => {
      service.destroyGame(gameId1)
      const game1 = service.getGameById(gameId1)
      const game2 = service.getGameById(gameId2)
      expect(game1).to.be.not.ok
      expect(game2).to.be.ok
    })

    it('should clean up any game resources')

    after(() => {
      service.destroyGame(gameId1)
      service.destroyGame(gameId2)
    })
  })

  describe ('#setupClient()', () => {
    const clientId1 = uuid.v4()
    const nickname1 = 'james'
    const clientId2 = uuid.v4()
    const nickname2 = 'bill'
    let gameId, game, socket1, socket2, addPlayer

    beforeEach(() => {
      gameId = service.createGame(gameOptions)
      game = service.getGameById(gameId)
      socket1 = {
        on: sinon.fake(),
        emit: sinon.fake(),
      }
      socket2 = {
        on: sinon.fake(),
        emit: sinon.fake(),
      }
      addPlayer = sinon.spy(game, 'addPlayer')
    })

    it('should add this player to the game', () => {
      service.setupClient({
        clientId: clientId1,
        nickname: nickname1,
        gameId,
        socket: socket1,
      })
      expect(addPlayer).to.have.been.calledOnce
      expect(addPlayer.lastCall.args[1]).to.equal(nickname1)
    })

    describe('client has already joined and still connected', () => {
      it('should emit existingConnection event to this player', () => {
        service.setupClient({
          clientId: clientId1,
          nickname: nickname1,
          gameId,
          socket: socket1,
        })
        service.setupClient({
          clientId: clientId1,
          nickname: nickname1,
          gameId,
          socket: socket1,
        })
        expect(addPlayer).to.have.been.calledTwice
        expect(socket1.emit.lastCall.args).to.deep.equal(['existingConnection'])
      })
    })

    it('should use a new playerId for a new client', () => {
      service.setupClient({
        clientId: clientId1,
        nickname: nickname1,
        gameId,
        socket: socket1,
      })
      service.setupClient({
        clientId: clientId2,
        nickname: nickname2,
        gameId,
        socket: socket2,
      })
      expect(addPlayer).to.have.been.calledTwice
      const playerId1 = addPlayer.firstCall.firstArg
      const playerId2 = addPlayer.secondCall.firstArg
      expect(playerId2).to.not.equal(playerId1)
    })

    it('should reuse the same playerId for the same client', () => {
      service.setupClient({
        clientId: clientId1,
        nickname: nickname1,
        gameId,
        socket: socket1,
      })
      service.setupClient({
        clientId: clientId1,
        nickname: nickname1,
        gameId,
        socket: socket1,
      })
      const playerId1a = addPlayer.firstCall.firstArg
      const playerId1b = addPlayer.secondCall.firstArg
      expect(playerId1a).to.equal(playerId1b)
    })

    describe('handle playerJoined event from the game', () => {
      it('should pass to client a selfJoined event containing the game state if the event describes himself joining', () => {
        service.setupClient({
          clientId: clientId1,
          nickname: nickname1,
          gameId,
          socket: socket1,
        })
        const playerId1 = addPlayer.firstCall.firstArg
        const gameState = game.getStateForPlayer(playerId1)
        expect(socket1.emit.firstCall.args).to.deep.equal(['selfJoined', {
          playerId: playerId1,  // needed so that player knows own playerId
          gameState,
        }])
      })

      it('should pass to client a playerJoined event without the game state if the event describes another player joining', () => {
        service.setupClient({
          clientId: clientId1,
          nickname: nickname1,
          gameId,
          socket: socket1,
        })
        service.setupClient({
          clientId: clientId2,
          nickname: nickname2,
          gameId,
          socket: socket2,
        })
        const playerId2 = addPlayer.secondCall.firstArg
        expect(socket1.emit.secondCall.args).to.deep.equal(['playerJoined', {
          id: playerId2,
          nickname: nickname2,
        }])
      })
    })

    it('should handle clickedCard event from the socket', () => {
      service.setupClient({
        clientId: clientId1,
        nickname: nickname1,
        gameId,
        socket: socket1,
      })
      const playerId1 = addPlayer.firstCall.firstArg
      expect(socket1.on).to.have.been.calledWith('clickedCard')
      const handler = socket1.on.getCalls()
        .filter(call => call.args[0] === 'clickedCard')[0]
        .lastArg
      // const randomCardIndex = Math.floor(Math.random() * game.cards.length)
      // const randomCardId = game.cards[randomCardIndex].id
      const someCardId = uuid.v4()
      const tryPlayerSelectCard = sinon.stub(game, 'tryPlayerSelectCard')
      handler({ id: someCardId })
      expect(tryPlayerSelectCard).to.have.been.calledOnceWith(playerId1, someCardId)
    })

    describe('handle playerSelectedCard event from the game', () => {
      beforeEach(() => {
        service.setupClient({
          clientId: clientId1,
          nickname: nickname1,
          gameId,
          socket: socket1,
        })
      })

      it('should pass to client a selfSelectedCard event containing the card value if the event describes himself selecting the card', () => {
        const playerId1 = addPlayer.firstCall.firstArg
        const someCardId = uuid.v4()
        const someCardValue = 1234
        game.emit('playerSelectedCard', {
          playerId: playerId1,
          cardId: someCardId,
          cardValue: someCardValue,
        })
        expect(socket1.emit.lastCall.args).to.deep.equal(['selfSelectedCard', {
          id: someCardId,
          value: someCardValue,
        }])
      })

      it('should pass to client a playerSelectedCard event without the card value if the event describes another player selecting the card', () => {
        const somePlayerId = uuid.v4()
        const someCardId = uuid.v4()
        const someCardValue = 1234
        game.emit('playerSelectedCard', {
          playerId: somePlayerId,
          cardId: someCardId,
          cardValue: someCardValue,
        })
        expect(socket1.emit.lastCall.args).to.deep.equal(['otherPlayerSelectedCard', {
          playerId: somePlayerId,
          cardId: someCardId,
        }])
      })
    })

    it('should handle playerSelectCardFailed event from the game', () => {
      service.setupClient({
        clientId: clientId1,
        nickname: nickname1,
        gameId,
        socket: socket1,
      })
      const somePlayerId = uuid.v4()
      const someCardId = uuid.v4()
      game.emit('playerSelectCardFailed', {
        playerId: somePlayerId,
        cardId: someCardId,
      })
      expect(socket1.emit.lastCall.args).to.deep.equal(['playerSelectCardFailed', {
        playerId: somePlayerId,
        cardId: someCardId,
      }])
    })

    it('should handle playerDeselectedCard event from the game',  () => {
      service.setupClient({
        clientId: clientId1,
        nickname: nickname1,
        gameId,
        socket: socket1,
      })
      const somePlayerId = uuid.v4()
      const someCardId = uuid.v4()
      game.emit('playerDeselectedCard', {
        playerId: somePlayerId,
        cardId: someCardId,
      })
      expect(socket1.emit.lastCall.args).to.deep.equal(['playerDeselectedCard', {
        playerId: somePlayerId,
        cardId: someCardId,
      }])
    })

    it('should handle matchFound event from the game', () => {
      service.setupClient({
        clientId: clientId1,
        nickname: nickname1,
        gameId,
        socket: socket1,
      })
      const somePlayerId = uuid.v4()
      const someCardId1 = uuid.v4()
      const someCardId2 = uuid.v4()
      const someCardValue = 2345
      game.emit('matchFound', {
        playerId: somePlayerId,
        cardIds: [someCardId1, someCardId2],
        cardValue: someCardValue,
      })
      expect(socket1.emit.lastCall.args).to.deep.equal(['matchFound', {
        playerId: somePlayerId,
        cardIds: [someCardId1, someCardId2],
        cardValue: someCardValue,
      }])
    })
  })
})
