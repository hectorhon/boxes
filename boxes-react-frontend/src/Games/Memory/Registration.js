import React from 'react'
import { useForm } from "react-hook-form";

function Registration(props) {
  const { onRegister } = props
  const { register, watch, getValues, trigger, handleSubmit, errors } = useForm()
  const watchCreateOrJoinGame = watch('create-or-join-game')

  function onSubmit({ nickname, gameid }) {
    onRegister({
      nickname,
      gameId: gameid ? gameid : undefined,  // form might return ''
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="nickname-input">Choose a nickname</label>
        <input id="nickname-input" name="nickname" autoComplete="off"
               ref={register({
                 required: true,
               })} />
        {
          errors.nickname
            && errors.nickname.type === 'required'
            && <span>Please enter a nickname.</span>
        }
      </div>
      <div>
        <input id="create-new-game-input" name="create-or-join-game"
               type="radio" value="create-new-game" defaultChecked
               onChange={() => errors.gameid && errors.gameid.type === 'required' && trigger('gameid')}
               ref={register({
                 required: true,
               })} />
        <label htmlFor="create-new-game-input">Create new game</label>
      </div>
      <div>
        <input id="join-existing-game-input" name="create-or-join-game"
               type="radio" value="join-existing-game"
               onChange={() => errors.gameid && errors.gameid.type === 'required' && trigger('gameid')}
               ref={register({
                 required: true,
               })} />
        <label htmlFor="join-existing-game-input">Join existing game</label>
        <input id="gameid-input" name="gameid" autoComplete="off"
               disabled={watchCreateOrJoinGame !== 'join-existing-game'}
               ref={register({
                 validate: {
                   required: value => {
                     const createOrJoinGame = getValues('create-or-join-game')
                     if (createOrJoinGame === 'join-existing-game') {
                       return !!value
                     } else {
                       return true
                     }
                   }
                 }
               })} />
        {
          errors.gameid
            && errors.gameid.type === 'required'
            && <span>Please enter the ID of the game to join.</span>
        }
      </div>
      <input type="submit" value="Enter" />
    </form>
  )
}

// f: A function that returns the promise to be debounced
// duration: Debounce duration
// state: A value returned from React useState()
// fieldName: An identifier to distinguish between different timeoutIds
// function debounce(f, duration, state, fieldName) {
//   return new Promise(resolve => {
//     const [timeoutIds, setTimeoutIds] = state
//     const existingTimeout = timeoutIds[fieldName]
//     if (existingTimeout) { clearTimeout(existingTimeout) }
//     const newTimeoutId = setTimeout(() => {
//       f().then(resolve)
//     }, duration)
//     setTimeoutIds(prevTimeoutsIds => ({
//       ...prevTimeoutsIds,
//       [fieldName]: newTimeoutId,
//     }))
//   })
// }

// <form onSubmit={handleSubmit(onSubmit)}>
//   <input name="nickname" ref={register({
//     required: false,
//     validate: value => debounce(() => new Promise(resolve => {
//       console.log('query', value)
//       if (value === 'a') {
//         resolve('a is not valid!!!')
//       } else {
//         resolve()
//       }
//     }), 1000, debounceState, 'nickname'),
//   })}/>
//   {errors.nickname && <span>{errors.nickname.message}</span>}
//   <input type="submit" />
// </form>

export default Registration
