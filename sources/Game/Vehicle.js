import * as THREE from 'three/webgpu'
import { Game } from './Game.js'

export class Vehicle
{
    constructor()
    {
        this.game = new Game()

        const chassisDescription = RAPIER.RigidBodyDesc.dynamic().setTranslation(0.0, 1.0, 0.0)
        this.chassisBody = this.game.physics.world.createRigidBody(chassisDescription)
        this.game.physics.world.createCollider(RAPIER.ColliderDesc.cuboid(1, 0.5, 2), this.chassisBody);

        // this.controller = new RAPIER.DynamicRayCastVehicleController(this.chassisBody)
        this.controller = this.game.physics.world.createVehicleController(this.chassisBody)

        const wheelGeneral = {
            axleCs: new THREE.Vector3(0, 0, -1),
            suspensionRestLength: 0.125,
            suspensionStiffness: 24,
            maxSuspensionTravel: 1,
            radius: 0.5,
        }
        const wheels = [
            { position: new THREE.Vector3( 0.65, -0.2,  0.75), ...wheelGeneral },
            { position: new THREE.Vector3( 0.65, -0.2, -0.75), ...wheelGeneral },
            { position: new THREE.Vector3(-0.65, -0.2,  0.75), ...wheelGeneral },
            { position: new THREE.Vector3(-0.65, -0.2, -0.75), ...wheelGeneral },
        ]

        let i = 0
        for(const _wheel of wheels)
        {
            this.controller.addWheel(_wheel.position, new THREE.Vector3(0, -1, 0), _wheel.axleCs, _wheel.suspensionRestLength, _wheel.radius)
            this.controller.setWheelSuspensionStiffness(i, _wheel.suspensionStiffness)
            this.controller.setWheelMaxSuspensionTravel(i, _wheel.maxSuspensionTravel)
            i++
        }

        this.game.time.events.on('tick', () =>
        {
            this.update()
        })
    }

    update()
    {
        this.controller.setWheelEngineForce(0, 1)
        this.controller.setWheelEngineForce(1, 1)
        this.controller.setWheelEngineForce(2, 1)
        this.controller.setWheelEngineForce(3, 1)
    }
}