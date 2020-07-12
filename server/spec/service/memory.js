const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const uuid = require('uuid')

chai.use(sinonChai)
const expect = chai.expect

const service = require('../../service/games/memory')

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
    let gameId, game, socket1, socket2, playerId1, addPlayer

    before(() => {
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

    beforeEach(() => {
      addPlayer.resetHistory()
    })

    it('should add this player to the game', () => {
      service.setupClient({
        clientId: clientId1,
        nickname: nickname1,
        gameId,
        socket: socket1,
      })
      expect(addPlayer).to.have.been.calledOnce
      playerId1 = addPlayer.lastCall.firstArg
      expect(addPlayer.lastCall.lastArg).to.equal(nickname1)
    })

    it('should use a new playerId for a new client', () => {
      service.setupClient({
        clientId: clientId2,
        nickname: nickname2,
        gameId,
        socket: socket2,
      })
      expect(addPlayer).to.have.been.calledOnce
      const playerId2 = addPlayer.lastCall.firstArg
      expect(playerId2).to.not.equal(playerId1)
    })

    it('should reuse the same playerId for the same client', () => {
      service.setupClient({
        clientId: clientId1,
        nickname: nickname1,
        gameId,
        socket: socket1,
      })
      expect(addPlayer).to.have.been.calledOnceWith(playerId1, nickname1)
    })

    it('should set up the events...')
  })
})
