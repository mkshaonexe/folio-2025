import * as THREE from 'three'
import { Cycles } from './Cycles.js'

export class YearCycles extends Cycles
{
    constructor()
    {
        super('🕜 Year Cycles', 60 * 60 * 24 * 365)
    }

    getKeyframesDescriptions()
    {
        const presets = {
            winter: { temperature: 10 },
            spring: { temperature: 20 },
            summer: { temperature: 30 },
            fall: { temperature: 20 },
        }
        
        // Debug
        if(this.game.debug.active)
        {
            for(const presetKey in presets)
            {
                // const preset = presets[presetKey]
                // const presetsDebugPanel = this.debugPanel.addFolder({
                //     title: presetKey,
                //     expanded: true,
                // })

                // this.game.debug.addThreeColorBinding(presetsDebugPanel, preset.lightColor, 'lightColor')
                // presetsDebugPanel.addBinding(preset, 'lightIntensity', { min: 0, max: 20 })
                // this.game.debug.addThreeColorBinding(presetsDebugPanel, preset.shadowColor, 'shadowColor')
                // this.game.debug.addThreeColorBinding(presetsDebugPanel, preset.fogColorA, 'fogColorA')
                // this.game.debug.addThreeColorBinding(presetsDebugPanel, preset.fogColorB, 'fogColorB')
                // presetsDebugPanel.addBinding(preset, 'fogNearRatio', { label: 'near', min: -2, max: 2, step: 0.001 })
                // presetsDebugPanel.addBinding(preset, 'fogFarRatio', { label: 'far', min: -2, max: 2, step: 0.001 })
            }
        }

        return [
            [
                { properties: presets.winter, stop: 0 + 0.125 },
                { properties: presets.spring, stop: 0.25 + 0.125 },
                { properties: presets.summer, stop: 0.5 + 0.125 },
                { properties: presets.fall, stop: 0.75 + 0.125 },
            ]
        ]
    }
}