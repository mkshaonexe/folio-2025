import { Debug } from './Debug.js'
import { Inputs } from './Inputs.js'
import { Physics } from './Physics/Physics.js'
import { PhysicsDebug } from './Physics/PhysicsDebug.js'
import { Rendering } from './Rendering.js'
import { Time } from './Time.js'
import { Vehicle } from './Vehicle.js'
import { View } from './View.js'
import { Viewport } from './Viewport.js'
import { World } from './World.js'

export class Game
{
    constructor()
    {
        // Singleton
        if(Game._instance)
            return Game._instance

        Game._instance = this

        // Setup
        this.domElement = document.querySelector('.game')

        this.debug = new Debug()
        this.inputs = new Inputs([
            { name: 'up', keys: [ 'ArrowUp', 'KeyW' ] },
            { name: 'right', keys: [ 'ArrowRight', 'KeyD' ] },
            { name: 'down', keys: [ 'ArrowDown', 'KeyS' ] },
            { name: 'left', keys: [ 'ArrowLeft', 'KeyA' ] },
            { name: 'boost', keys: [ 'ShiftLeft', 'ShiftRight' ] },
            { name: 'brake', keys: [ 'KeyB' ] },
            { name: 'reset', keys: [ 'KeyR' ] },
            { name: 'hydrolics', keys: [ 'Numpad5', 'Space' ] },
            { name: 'hydrolicsFront', keys: [ 'Numpad8' ] },
            { name: 'hydrolicsBack', keys: [ 'Numpad2' ] },
            { name: 'hydrolicsRight', keys: [ 'Numpad6' ] },
            { name: 'hydrolicsLeft', keys: [ 'Numpad4' ] },
            { name: 'hydrolicsFrontLeft', keys: [ 'Numpad7' ] },
            { name: 'hydrolicsFrontRight', keys: [ 'Numpad9' ] },
            { name: 'hydrolicsBackRight', keys: [ 'Numpad3' ] },
            { name: 'hydrolicsBackLeft', keys: [ 'Numpad1' ] },
        ])
        this.time = new Time()
        this.viewport = new Viewport(this.domElement)
        this.physics = new Physics()
        this.world = new World()
        this.physicsDebug = new PhysicsDebug()
        this.view = new View()
        this.rendering = new Rendering()
        this.vehicle = new Vehicle()
    }
}

