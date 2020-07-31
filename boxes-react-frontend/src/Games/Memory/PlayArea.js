import React, { useRef, useState, useEffect, useCallback } from 'react'
import io from 'socket.io-client'
import update from 'immutability-helper'

import Card from './Card'

function PlayArea(props) {
  const { context } = props
  const { clientId, nickname, gameId } = context
  const socketRef = useRef()
  const [playerId, setPlayerId] = useState()
  const [gameState, setGameState] = useState()

  useEffect(() => {
    const socket  = io('http://localhost:3000/games/memory', {
      reconnection: false,
      query: {
        clientId,
        nickname,
        gameId,
      }
    })
    socketRef.current = socket
    return () => {
      socket.close()
    }
  }, [clientId, nickname, gameId])

  const onSelfSelectedCard = useCallback(({ id, value }) => {
    setGameState(prevGameState => {
      const newGameState = update(prevGameState, {
        cards: {
          [prevGameState.cards.findIndex(card => card.id === id)]: {
            selectedBy: { $set: playerId },
            value: { $set: value },
          }
        }
      })
      return newGameState
    })
  }, [playerId])

  useEffect(() => {
    const socket = socketRef.current

    socket.on('disconnect', reason => {
      console.log('Disconnected due to', reason)
    })

    socket.on('selfJoined', ({ playerId, gameState }) => {
      setPlayerId(playerId)
      setGameState(gameState)
    })

    socket.on('playerJoined', ({ id: playerId, nickname }) => {
      setGameState(prevGameState => {
        const newGameState = update(prevGameState, {
          players: {
            $push: {
              id: playerId,
              nickname,
              selectedCards: []
            }
          }
        })
        return newGameState
      })
    })

    socket.on('playerDisconnected', () => {
    })

    socket.on('selfReconnected', ({ playerId, gameState }) => {
      setPlayerId(playerId)
      setGameState(gameState)
    })

    socket.on('playerReconnected', () => {
    })

    socket.on('selfSelectedCard', onSelfSelectedCard)

    socket.on('otherPlayerSelectedCard', ({ playerId, cardId }) => {
      setGameState(prevGameState => {
        const newGameState = update(prevGameState, {
          cards: {
            [prevGameState.cards.findIndex(card => card.id === cardId)]: {
              selectedBy: { $set: playerId }
            }
          }
        })
        return newGameState
      })
    })

    socket.on('playerSelectCardFailed', ({ playerId, cardId }) => {
    })

    socket.on('playerDeselectedCard', ({ playerId, cardId }) => {
    })

    socket.on('matchFound', ({ playerId, cardIds, cardValue }) => {
    })

    return (() => {
      socket.off('selfSelectedCard', onSelfSelectedCard)
    })
  }, [clientId, nickname, gameId, onSelfSelectedCard])

  function handleCardClick(cardId) {
    socketRef.current.emit('clickedCard', {
      id: cardId
    })
  }

  function getCardColor(card) {
    if (card.selectedBy === playerId) {
      return '#FF0000'
    } else if (!card.selectedBy) {  // no one selected
      return '#800080'
    } else {  // selected by another player
      return '#0000FF'
    }
  }

  if (!gameState) {
    return (
      <p>Connecting to {gameId || 'a new game'} as {nickname}...</p>
    )
  } else {
    return (
      <div className="play-area">
        <div className="card-area">
          {gameState.cards.map(card => {
            return <Card key={card.id}
                         value={card.value}
                         color={getCardColor(card)}
                         onClick={() => handleCardClick(card.id)} />
          })}
        </div>
      </div>
    )
  }
}

export default PlayArea
