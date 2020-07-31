import React, { useState, useEffect } from 'react'
import uuid from 'uuid'

import Registration from './Registration'
import PlayArea from './PlayArea'

function Game() {
  // const clientId = uuid.v4()
  const clientId = '646bb6f2-e4da-49ad-98ac-a7160a748f59'
  const [nickname, setNickname] = useState()
  const [gameId, setGameId] = useState()
  const [isRegistered, setIsRegistered] = useState(false)

  // development
  // useEffect(() => {
  //   setNickname('dev-player')
  //   setGameId('63712f65-2890-44ce-9e00-c55d95cd4f9a')
  //   setIsRegistered(true)
  // }, [])

  async function register({ nickname, gameId }) {
    setNickname(nickname)
    if (gameId) {
      setGameId(gameId)
    } else {
      const newGameId = await createNewGame()
      setGameId(newGameId)
    }
    setIsRegistered(true)
  }

  async function createNewGame() {
    const response = await fetch('http://localhost:3000/games/memory/create', {
      method: 'POST',
      mode: 'cors',
    })
    const { gameId: newGameId } = await response.json()
    return newGameId
  }

  return (
    <div>
      <h2>Memory Game</h2>
      {!isRegistered
       ? <Registration onRegister={register} />
       : <div>
           <p>Game ID: {gameId}</p>
           <PlayArea context={{ clientId, nickname, gameId }}/>
         </div>}
    </div>
  )
}

export default Game
