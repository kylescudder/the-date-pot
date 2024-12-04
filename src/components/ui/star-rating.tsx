import React, { useState } from 'react'
import { cn } from '@/lib/utils'

interface StarRatingProps extends React.InputHTMLAttributes<HTMLInputElement> {
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
          d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
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
            d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
          />
        </svg>
      </div>
    </div>
  )
}

export { StarRating }
