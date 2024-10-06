import React from 'react'

function Logo({width = '100px'}) {
  return (
    <div>
      <img className='rounded-full backdrop-blur-3xl' src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3ZDySYu2QfisCbt3daKcS0r5ewGigtfkDag&s" alt="logo" width={width} />
    </div>
  )
}

export default Logo