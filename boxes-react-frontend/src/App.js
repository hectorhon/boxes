import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from 'react-router-dom'

import './App.css'
import MemoryGame from './Games/Memory'

function App() {
  return (
    <div>
      <h1>Boxes</h1>
      <Router>
        <div>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/games/memory">Memory game</Link></li>
          </ul>

          <Switch>
            <Route exact path="/"><Home /></Route>
            <Route exact path="/games/memory"><MemoryGame /></Route>
            <Route><p>Not found</p></Route>
          </Switch>
        </div>
      </Router>
    </div>
  )
}

function Home() {
  return <h2>Home</h2>;
}

export default App
