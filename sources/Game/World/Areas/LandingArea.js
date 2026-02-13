import * as THREE from 'three/webgpu'
import { color, float, Fn, instancedArray, mix, normalWorld, positionGeometry, step, texture, uniform, uv, vec2, vec3, vec4 } from 'three/tsl'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { Inputs } from '../../Inputs/Inputs.js'
import { InteractivePoints } from '../../InteractivePoints.js'
import { Area } from './Area.js'
import gsap from 'gsap'
import { MeshDefaultMaterial } from '../../Materials/MeshDefaultMaterial.js'

export class LandingArea extends Area {
    constructor(model) {
        super(model)

        this.localTime = uniform(0)

        this.setLetters()
        this.setKiosk()
        this.setControls()
        this.setBonfire()
        this.setAchievement()
    }

    setLetters() {
        const references = this.references.items.get('letters')

        if (!references || references.length === 0) {
            console.error('No letter references found in LandingArea')
            return
        }

        // Calculate bounding box before removing
        let minX = Infinity, minZ = Infinity, maxX = -Infinity, maxZ = -Infinity
        let varyY = 0
        let hasValidBounds = false

        for (const reference of references) {
            // Capture bounds
            if (reference.position) {
                minX = Math.min(minX, reference.position.x)
                maxX = Math.max(maxX, reference.position.x)
                minZ = Math.min(minZ, reference.position.z)
                maxZ = Math.max(maxZ, reference.position.z)
                varyY = reference.position.y
                hasValidBounds = true
            }

            // Remove from scene graph (safest way to hide)
            if (reference.parent) {
                reference.parent.remove(reference)
            } else {
                reference.visible = false // Fallback
            }

            // Disable physics
            if (reference.userData.object && reference.userData.object.physical && reference.userData.object.physical.body) {
                reference.userData.object.physical.body.setEnabled(false)
            }
        }

        let centerX = 0
        let centerZ = 0

        if (hasValidBounds && isFinite(minX) && isFinite(maxX)) {
            centerX = (minX + maxX) / 2
            centerZ = (minZ + maxZ) / 2
        }

        console.log('Replacing 3D text. Local Bounds:', { minX, maxX, minZ, maxZ, centerX, centerZ, varyY })

        // Add new text
        const loader = new FontLoader()
        loader.load('/fonts/helvetiker_bold.typeface.json', (font) => {
            const geometry = new TextGeometry('@MKSHAON7', {
                font: font,
                size: 1.5,
                height: 0.2,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 5
            })

            geometry.center()

            // Use white material
            const material = new MeshDefaultMaterial({
                colorNode: color('#ffffff')
            })

            const mesh = new THREE.Mesh(geometry, material)

            // Orientation: flat on ground
            mesh.rotation.x = -Math.PI * 0.5

            // Position relative to the LandingArea model
            mesh.position.set(centerX, varyY + 0.2, centerZ)

            mesh.castShadow = true
            mesh.receiveShadow = true

            // Add to the area model instead of the global scene
            this.model.add(mesh)

            console.log('Text mesh added to LandingArea model at', mesh.position)
        }, undefined, (err) => {
            console.error('Failed to load font:', err)
        })
    }

    setKiosk() {
        // Interactive point
        const interactivePoint = this.game.interactivePoints.create(
            this.references.items.get('kioskInteractivePoint')[0].position,
            'Map',
            InteractivePoints.ALIGN_RIGHT,
            InteractivePoints.STATE_CONCEALED,
            () => {
                this.game.inputs.interactiveButtons.clearItems()
                this.game.modals.open('map')
                // interactivePoint.hide()
            },
            () => {
                this.game.inputs.interactiveButtons.addItems(['interact'])
            },
            () => {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            },
            () => {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            }
        )

        // this.game.map.items.get('map').events.on('close', () =>
        // {
        //     interactivePoint.show()
        // })
    }

    setControls() {
        // Interactive point
        const interactivePoint = this.game.interactivePoints.create(
            this.references.items.get('controlsInteractivePoint')[0].position,
            'Controls',
            InteractivePoints.ALIGN_RIGHT,
            InteractivePoints.STATE_CONCEALED,
            () => {
                this.game.inputs.interactiveButtons.clearItems()
                this.game.menu.open('controls')
                interactivePoint.hide()
            },
            () => {
                this.game.inputs.interactiveButtons.addItems(['interact'])
            },
            () => {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            },
            () => {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            }
        )

        // Menu instance
        const menuInstance = this.game.menu.items.get('controls')

        menuInstance.events.on('close', () => {
            interactivePoint.show()
        })

        menuInstance.events.on('open', () => {
            if (this.game.inputs.mode === Inputs.MODE_GAMEPAD)
                menuInstance.tabs.goTo('gamepad')
            else if (this.game.inputs.mode === Inputs.MODE_MOUSEKEYBOARD)
                menuInstance.tabs.goTo('mouse-keyboard')
            else if (this.game.inputs.mode === Inputs.MODE_TOUCH)
                menuInstance.tabs.goTo('touch')
        })
    }

    setBonfire() {
        const position = this.references.items.get('bonfireHashes')[0].position

        // Particles
        let particles = null
        {
            const emissiveMaterial = this.game.materials.getFromName('emissiveOrangeRadialGradient')

            const count = 30
            const elevation = uniform(5)
            const positions = new Float32Array(count * 3)
            const scales = new Float32Array(count)


            for (let i = 0; i < count; i++) {
                const i3 = i * 3

                const angle = Math.PI * 2 * Math.random()
                const radius = Math.pow(Math.random(), 1.5) * 1
                positions[i3 + 0] = Math.cos(angle) * radius
                positions[i3 + 1] = Math.random()
                positions[i3 + 2] = Math.sin(angle) * radius

                scales[i] = 0.02 + Math.random() * 0.06
            }

            const positionAttribute = instancedArray(positions, 'vec3').toAttribute()
            const scaleAttribute = instancedArray(scales, 'float').toAttribute()

            const material = new THREE.SpriteNodeMaterial()
            material.outputNode = emissiveMaterial.outputNode

            const progress = float(0).toVar()

            material.positionNode = Fn(() => {
                const newPosition = positionAttribute.toVar()
                progress.assign(newPosition.y.add(this.localTime.mul(newPosition.y)).fract())

                newPosition.y.assign(progress.mul(elevation))
                newPosition.xz.addAssign(this.game.wind.direction.mul(progress))

                const progressHide = step(0.8, progress).mul(100)
                newPosition.y.addAssign(progressHide)

                return newPosition
            })()
            material.scaleNode = Fn(() => {
                const progressScale = progress.remapClamp(0.5, 1, 1, 0)
                return scaleAttribute.mul(progressScale)
            })()

            const geometry = new THREE.CircleGeometry(0.5, 8)

            particles = new THREE.Mesh(geometry, material)
            particles.visible = false
            particles.position.copy(position)
            particles.count = count
            this.game.scene.add(particles)
        }

        // Hashes
        {
            const alphaNode = Fn(() => {
                const baseUv = uv(1)
                const distanceToCenter = baseUv.sub(0.5).length()

                const voronoi = texture(
                    this.game.noises.voronoi,
                    baseUv
                ).g

                voronoi.subAssign(distanceToCenter.remap(0, 0.5, 0.3, 0))

                return voronoi
            })()

            const material = new MeshDefaultMaterial({
                colorNode: color(0x6F6A87),
                alphaNode: alphaNode,
                hasWater: false,
                hasLightBounce: false
            })

            const mesh = this.references.items.get('bonfireHashes')[0]
            mesh.material = material
        }

        // Burn
        const burn = this.references.items.get('bonfireBurn')[0]
        burn.visible = false

        // Interactive point
        this.game.interactivePoints.create(
            this.references.items.get('bonfireInteractivePoint')[0].position,
            'Res(e)t',
            InteractivePoints.ALIGN_RIGHT,
            InteractivePoints.STATE_CONCEALED,
            () => {
                this.game.reset()

                gsap.delayedCall(2, () => {
                    // Bonfire
                    particles.visible = true
                    burn.visible = true
                    this.game.ticker.wait(2, () => {
                        particles.geometry.boundingSphere.center.y = 2
                        particles.geometry.boundingSphere.radius = 2
                    })

                    // Sound
                    this.game.audio.groups.get('campfire').items[0].positions.push(position)
                })
            },
            () => {
                this.game.inputs.interactiveButtons.addItems(['interact'])
            },
            () => {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            },
            () => {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            }
        )
    }

    setAchievement() {
        this.events.on('boundingIn', () => {
            this.game.achievements.setProgress('areas', 'landing')
        })
        this.events.on('boundingOut', () => {
            this.game.achievements.setProgress('landingLeave', 1)
        })
    }

    update() {
        this.localTime.value += this.game.ticker.deltaScaled * 0.1
    }
}