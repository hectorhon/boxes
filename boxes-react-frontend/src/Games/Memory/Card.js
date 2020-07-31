import React from 'react'
import './Card.css'

function Card(props) {
  const { value, color, onClick } = props
  return (
    <div className="card"
         style={{
           backgroundColor: color
         }}
         onClick={onClick}>
      {value}
    </div>
  )
}

export default Card
