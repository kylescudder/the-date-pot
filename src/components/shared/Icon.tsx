import React, { useState, useEffect } from 'react'

interface IconProps {
  name: string
  stroke?: string
  strokeLinejoin?: string
  isActive: boolean
}

export default function Icon(props: IconProps) {
  const [IconComponent, setIconComponent] = useState<React.ElementType | null>(
    null
  )

  useEffect(() => {
    import('@tabler/icons-react')
      .then((module) => {
        const iconComponent = module[props.name] as React.ElementType
        if (iconComponent) {
          setIconComponent(iconComponent)
        }
      })
      .catch((error) => {
        console.error('Error loading icon:', error)
      })
  }, [props.name])

  if (!IconComponent) {
    return (
      <>
        <div className='animated'>
          <div className='avatar'>
            <div className='avatar-image'></div>
          </div>
        </div>
      </>
    )
  }

  return (
    <IconComponent
      className={`${props.isActive && 'text-white'} text-zinc-900 dark:text-white`}
      {...(props.stroke && { stroke: props.stroke })}
      {...(props.strokeLinejoin && { strokeLinejoin: props.strokeLinejoin })}
    />
  )
}
