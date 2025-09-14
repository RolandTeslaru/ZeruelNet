import React from 'react'
import { Preset } from './types'
import { Button } from '../button'
import { Check } from '../../icons'
import { cn } from '../../utils/cn'

export interface PresetSelectorProps {
    presets: Preset[]
    selectedPreset: string | undefined
    onSelectPreset: (preset: string) => void
    className?: string
}

const PresetSelector: React.FC<PresetSelectorProps> = (
    { presets, selectedPreset, onSelectPreset, className }
) => (
    <div className={`flex flex-col items-end gap-2 rounded-lg ${className}`}>
        {presets.map((preset, index) => (
            <PresetButton
                key={index}
                isSelected={selectedPreset === preset.name}
                onClick={() => onSelectPreset(preset.name)}
            >
                {preset.label}
            </PresetButton>
        ))}
    </div>
)

export default PresetSelector

const PresetButton = ({
    children,
    isSelected,
    ...buttonProps
}: React.HTMLAttributes<HTMLButtonElement> & { isSelected: boolean }) => (
    <Button
        variant='accent'
        size='xs'
        className='w-full'
        {...buttonProps}
    >
        <span className={cn(' opacity-0', isSelected && 'opacity-70')}>
            <Check size={18} />
        </span>
        <p className='ml-auto font-roboto-mono'>
            {children}
        </p>
    </Button>
)

