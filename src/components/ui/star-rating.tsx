import React, { useState } from 'react'
import { cn } from '@/lib/utils'

interface StarRatingProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  max?: number
  value?: number
  onChange?: (value: number) => void
  increment?: number
  readOnly?: boolean
}

const StarRating = React.forwardRef<HTMLInputElement, StarRatingProps>(
  (
    {
      max = 5,
      value = 0,
      onChange,
      increment = 0.5,
      readOnly = false,
      className,
      ...props
    },
    ref
  ) => {
    const [hoverValue, setHoverValue] = useState<number | null>(null)

    const handleMouseMove = (
      event: React.MouseEvent<HTMLDivElement>,
      index: number
    ) => {
      if (readOnly) return
      const star = event.currentTarget
      const rect = star.getBoundingClientRect()
      const width = rect.width
      const x = event.clientX - rect.left
      const fraction = Math.ceil(x / width / increment) * increment
      setHoverValue(index + fraction)
    }

    const handleMouseLeave = () => {
      if (readOnly) return
      setHoverValue(null)
    }

    const handleClick = () => {
      if (readOnly) return
      if (hoverValue !== null && onChange) {
        onChange(Math.min(Math.max(hoverValue, 0), max))
      }
    }

    const displayValue = readOnly
      ? value
      : hoverValue !== null
        ? hoverValue
        : value

    return (
      <div
        className={cn(
          'flex items-center',
          className,
          readOnly ? 'pointer-events-none' : ''
        )}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        role='group'
        aria-label={`Rating: ${displayValue.toFixed(2)} out of ${max} stars`}
      >
        {[...Array(max)].map((_, index) => (
          <Star
            key={index}
            filled={Math.min(Math.max(displayValue - index, 0), 1)}
            onMouseMove={(e) => handleMouseMove(e, index)}
            readOnly={readOnly}
          />
        ))}
        <input
          type='number'
          className='sr-only'
          value={value}
          readOnly={readOnly}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
StarRating.displayName = 'StarRating'

interface StarProps {
  filled: number
  onMouseMove: (event: React.MouseEvent<HTMLDivElement>) => void
  readOnly: boolean
}

const Star: React.FC<StarProps> = ({ filled, onMouseMove, readOnly }) => {
  return (
    <div
      className={`relative h-10 w-10 ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
      onMouseMove={onMouseMove}
    >
      <svg
        className='absolute h-10 w-10'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'
        />
      </svg>
      <div
        className='absolute inset-0 overflow-hidden'
        style={{ width: `${filled * 100}%` }}
      >
        <svg
          className='h-10 w-10'
          fill='currentColor'
          viewBox='0 0 24 24'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            stroke='#fab387' // Catppuccin Mocha yellow (Peach)
            d='M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'
            fill='#fab387' // Catppuccin Mocha yellow (Peach)
          />
        </svg>
      </div>
    </div>
  )
}

export { StarRating }
