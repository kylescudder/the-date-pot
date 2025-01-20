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

    const calculateRating = (
      element: HTMLDivElement,
      clientX: number,
      index: number
    ) => {
      if (readOnly) return null

      const rect = element.getBoundingClientRect()
      const width = rect.width
      const x = clientX - rect.left
      const fraction = Math.ceil(x / width / increment) * increment
      return Math.min(Math.max(index + fraction, 0), max)
    }

    const handleMove = (
      event:
        | React.MouseEvent<HTMLDivElement>
        | React.TouchEvent<HTMLDivElement>,
      index: number
    ) => {
      if (readOnly) return

      const element = event.currentTarget
      const clientX =
        'touches' in event ? event.touches[0].clientX : event.clientX

      const newValue = calculateRating(element, clientX, index)
      if (newValue !== null) {
        setHoverValue(newValue)
      }
    }

    const handleMoveEnd = (
      event:
        | React.MouseEvent<HTMLDivElement>
        | React.TouchEvent<HTMLDivElement>,
      index: number
    ) => {
      if (readOnly || !onChange) return

      const element = event.currentTarget
      const clientX =
        'changedTouches' in event
          ? event.changedTouches[0].clientX
          : event.clientX

      const newValue = calculateRating(element, clientX, index)
      if (newValue !== null) {
        onChange(newValue)
        setHoverValue(null)
      }
    }

    const handleLeave = () => {
      if (readOnly) return
      setHoverValue(null)
    }

    const displayValue = hoverValue !== null ? hoverValue : value

    return (
      <div
        className={cn(
          'flex touch-none items-center',
          className,
          readOnly ? 'pointer-events-none' : ''
        )}
        onMouseLeave={handleLeave}
        onTouchCancel={handleLeave}
        role='group'
        aria-label={`Rating: ${displayValue.toFixed(2)} out of ${max} stars`}
      >
        {[...Array(max)].map((_, index) => (
          <Star
            key={index}
            filled={Math.min(Math.max(displayValue - index, 0), 1)}
            onMove={(e) => handleMove(e, index)}
            onMoveEnd={(e) => handleMoveEnd(e, index)}
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
  onMove: (
    event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) => void
  onMoveEnd: (
    event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) => void
  readOnly: boolean
}

const Star: React.FC<StarProps> = ({ filled, onMove, onMoveEnd, readOnly }) => {
  return (
    <div
      className={cn(
        'relative h-10 w-10',
        readOnly ? 'cursor-default' : 'cursor-pointer'
      )}
      onMouseMove={onMove}
      onMouseUp={onMoveEnd}
      onTouchMove={onMove}
      onTouchEnd={onMoveEnd}
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
            stroke='#fab387'
            d='M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'
            fill='#fab387'
          />
        </svg>
      </div>
    </div>
  )
}

export { StarRating }
