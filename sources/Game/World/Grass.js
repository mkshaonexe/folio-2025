import * as THREE from 'three'
import { Game } from '../Game.js'
import { texture, transformNormalToView, positionViewDirection, uniformArray, varying, vertexIndex, rotateUV, cameraPosition, vec4, cameraProjectionMatrix, cameraViewMatrix, atan2, billboarding, vec3, vec2, modelWorldMatrix, Fn, attribute, positionGeometry } from 'three'

export class Grass
{
    constructor()
    {
        this.game = new Game()

        this.details = 300
        this.size = 40
        this.count = this.details * this.details
        this.fragmentSize = this.size / this.details
        this.bladeWidthRatio = 1.5
        this.bladeHeightRatio = 3
        this.bladeHeightRandomness = 0.5
        this.positionRandomness = 1

        this.game.resources.load(
            [
                { path: 'matcaps/grassOnGreen.png', type: 'texture', name: 'matcapGrassOnGreen' },
            ],
            (resources) =>
            {
                this.resources = resources
                this.resources.matcapGrassOnGreen.colorSpace = THREE.SRGBColorSpace
                this.init()
            }
        )
    }

    init()
    {
        this.setGeometry()
        this.setMaterial()
        this.setMesh()
    }

    setGeometry()
    {
        const position = new Float32Array(this.count * 3 * 2)
        const randomness = new Float32Array(this.count * 3)

        for(let iX = 0; iX < this.details; iX++)
        {
            const fragmentX = (iX / this.details - 0.5) * this.size + this.fragmentSize * 0.5
            
            for(let iZ = 0; iZ < this.details; iZ++)
            {
                const fragmentZ = (iZ / this.details - 0.5) * this.size + this.fragmentSize * 0.5

                const i = (iX * this.details + iZ)
                const i3 = (iX * this.details + iZ) * 3
                const i6 = (iX * this.details + iZ) * 6

                // Center of the blade
                const positionX = fragmentX + (Math.random() - 0.5) * this.fragmentSize * this.positionRandomness
                const positionZ = fragmentZ + (Math.random() - 0.5) * this.fragmentSize * this.positionRandomness

                position[i6    ] = positionX
                position[i6 + 1] = positionZ

                position[i6 + 2] = positionX
                position[i6 + 3] = positionZ

                position[i6 + 4] = positionX
                position[i6 + 5] = positionZ

                // Randomness
                randomness[i3    ] = Math.random()
                randomness[i3 + 1] = Math.random()
                randomness[i3 + 2] = Math.random()
            }
        }
        
        this.geometry = new THREE.BufferGeometry()
        this.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1)
        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(position, 2))
        this.geometry.setAttribute('randomness', new THREE.Float32BufferAttribute(randomness, 1))
    }

    setMaterial()
    {
        this.material = new THREE.MeshBasicNodeMaterial()

        const vertexLoopIndex = varying(vertexIndex.toFloat().mod(3))
        const tipness = varying(vertexLoopIndex.step(0.5))

        const bladeWidth = this.fragmentSize * this.bladeWidthRatio
        const bladeHalfWidth = bladeWidth * 0.5
        const bladeHeight = this.fragmentSize * this.bladeHeightRatio
        const shapeUniform = uniformArray([

                // Tip
                0,
                bladeHeight,

                // Left side
                bladeHalfWidth,
                0,

                // Right side
                - bladeHalfWidth,
                0,
        ])
        this.material.vertexNode = Fn(() =>
        {
            // Center
            const position = attribute('position')
            const position3 = vec3(position.x, 0, position.y)
            const worldCenter = modelWorldMatrix.mul(position3)

            // Height
            const height = attribute('randomness').mul(0.4).add(0.6)

            // Shape
            const shape = vec3(
                shapeUniform.element(vertexLoopIndex.mod(3).mul(2)),
                shapeUniform.element(vertexLoopIndex.mod(3).mul(2).add(1)).mul(height),
                0
            )
            const newPosition = position3.add(shape)
            const worldPosition = modelWorldMatrix.mul(newPosition)

            const angleToCamera = atan2(worldCenter.z.sub(cameraPosition.z), worldCenter.x.sub(cameraPosition.x)).add(- Math.PI * 0.5)
            worldPosition.xz.assign(rotateUV(worldPosition.xz, angleToCamera, worldCenter.xz))

            return cameraProjectionMatrix.mul(cameraViewMatrix).mul(worldPosition)
        })()

        // this.material.outputNode = Fn(() =>
        // {
        //     return vec4(vec3(vertexLoopIndex.div(3)), 1)
        // })()


        this.material.colorNode = Fn(() =>
        {
            const x = vec3(positionViewDirection.z, 0, positionViewDirection.x.negate()).normalize()
            const y = positionViewDirection.cross(x)

            const customTransformedNormalView = transformNormalToView(vec3(0, 1, 0))
            const customMatcapUv = vec2(x.dot(customTransformedNormalView), y.dot(customTransformedNormalView) ).mul(0.495).add(0.5)

            const matcapColor = texture(this.resources.matcapGrassOnGreen, customMatcapUv)

            const finalColor = matcapColor.mul(tipness)

            // return vec4(matcapColor.rgb, 1)
            return vec4(finalColor.rgb, 1)
            // return vec4(vec3(tipness), 1)
        })()
    }

    setMesh()
    {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.frustumCulled = false
        this.game.scene.add(this.mesh)
    }
}